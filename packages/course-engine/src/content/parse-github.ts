/**
 * parse-github.ts
 * Reads a challenge's optional `github` field (wave B): the practice repository's name and
 * the scripted teammate steps. Also enforces the content safety rules (assumption A5):
 * - the repository's name starts with "gitremastered-practice";
 * - setup lines never call `gh` and never name a github.com address: they reach the
 *   practice repository only through $PRACTICE_GITHUB_URL, and every GitHub write of a
 *   setup goes through the guarded teammate steps;
 * - solution lines (what the student types) may use `gh`, but never name an address or
 *   another repository (`--repo`, `-R`), and never delete a repository.
 */

import { practiceRepoPrefix, type GitHubChallenge, type TeammateStep } from '../types/github.ts';
import type { FieldReader } from './field-reader.ts';

/** The merge methods GitHub knows. */
const mergeMethods = ['merge', 'squash', 'rebase'] as const;

/**
 * Reads the `github` field of one challenge.
 * @param githubReader - a reader for the field, or null when the challenge has none
 * @returns the GitHub challenge, or null
 */
export function readGitHubChallenge(githubReader: FieldReader | null): GitHubChallenge | null {
	if (githubReader === null) {
		return null;
	}
	const repo = readRepoName(githubReader, 'repo');
	const upstream =
		githubReader.optionalText('upstream') === null ? null : readRepoName(githubReader, 'upstream');
	if (upstream === repo) {
		githubReader.fail('"upstream" must be another repository than "repo"');
	}
	const teammate = githubReader.optionalRecordList('teammate', 'step').map(readTeammateStep);
	return { repo, upstream, teammate };
}

/**
 * Reads a practice repository's name and checks it is a safe practice name.
 * @param githubReader - the `github` field's reader
 * @param fieldName - "repo" or "upstream"
 * @returns the name
 */
function readRepoName(githubReader: FieldReader, fieldName: string): string {
	const name = githubReader.text(fieldName);
	const hasSafeName = /^[a-z0-9-]+$/.test(name) && name.startsWith(practiceRepoPrefix);
	if (!hasSafeName) {
		githubReader.fail(
			`"${fieldName}" must start with ${practiceRepoPrefix} and use only a-z, 0-9 and -`
		);
	}
	return name;
}

/**
 * Reads one teammate step.
 * @param stepReader - a reader for one item of `teammate`
 * @returns the typed step
 */
function readTeammateStep(stepReader: FieldReader): TeammateStep {
	const action = stepReader.text('action');
	switch (action) {
		case 'open-pull-request':
			return {
				action,
				head: stepReader.text('head'),
				base: stepReader.text('base'),
				title: stepReader.text('title'),
				body: stepReader.optionalText('body') ?? ''
			};
		case 'comment-pull-request':
			return { action, head: stepReader.text('head'), body: stepReader.text('body') };
		case 'merge-pull-request': {
			const method = stepReader.text('method');
			if (!(mergeMethods as readonly string[]).includes(method)) {
				stepReader.fail(`"method" must be one of ${mergeMethods.join(', ')}`);
			}
			return {
				action,
				head: stepReader.text('head'),
				method: method as (typeof mergeMethods)[number]
			};
		}
		case 'create-issue':
			return {
				action,
				title: stepReader.text('title'),
				body: stepReader.optionalText('body') ?? '',
				labels: stepReader.optionalTextList('labels')
			};
		default:
			return stepReader.fail(`unknown teammate action "${action}"`);
	}
}

/**
 * Checks the safety rules for a challenge's setup and solution lines (assumption A5).
 * @param challengeReader - the challenge's reader, for the error message
 * @param setup - its setup lines
 * @param solution - its solution lines
 */
export function checkGitHubLines(
	challengeReader: FieldReader,
	setup: string[],
	solution: string[]
): void {
	for (const line of setup) {
		if (isUnsafeSetupLine(line)) {
			challengeReader.fail(
				`setup line "${line}" calls gh, names a GitHub address or changes $PRACTICE_GITHUB_URL; use a teammate step or the plain "$PRACTICE_GITHUB_URL"`
			);
		}
	}
	for (const line of solution) {
		if (isUnsafeSolutionLine(line)) {
			challengeReader.fail(
				`solution line "${line}" names an address or another repository, or deletes one`
			);
		}
	}
}

/**
 * Tells whether a setup line breaks the rules (security audit M2). Letter case is ignored,
 * so `GitHub.com` is caught too. `gh` is refused anywhere as a word (also as `\gh` or "gh");
 * curl, wget and the API address are refused; the practice address may only appear as the
 * plain variable, never with a shell modifier like `${PRACTICE_GITHUB_URL%/*}` that could
 * turn it into another repository's address.
 * @param line - one setup line
 * @returns true when the line must be refused
 */
function isUnsafeSetupLine(line: string): boolean {
	const lowerLine = line.toLowerCase();
	const callsGh = /(^|[^a-z0-9_-])gh([^a-z0-9_-]|$)/.test(lowerLine);
	const namesGitHub = lowerLine.includes('github.com');
	const callsTheWeb = /(^|[^a-z0-9_-])(curl|wget)([^a-z0-9_-]|$)/.test(lowerLine);
	const changesPracticeAddress = /\$\{practice_github_(upstream_)?url[^}]/.test(lowerLine);
	return callsGh || namesGitHub || callsTheWeb || changesPracticeAddress;
}

/**
 * Tells whether a solution line breaks the rules. Solutions are what the student types, so
 * `gh` is allowed, but never on another repository, an address, or to delete a repository.
 * A `gh api` call that writes must target the practice repository through the
 * `repos/{owner}/{repo}` placeholders, which gh fills from the current repository.
 * @param line - one solution line
 * @returns true when the line must be refused
 */
function isUnsafeSolutionLine(line: string): boolean {
	const lowerLine = line.toLowerCase();
	const namesAddress = lowerLine.includes('github.com') || /(^|\s)(curl|wget)\s/.test(lowerLine);
	const namesOtherRepository = /\s(--repo|-r)(\s|=)/.test(line.replace(/-R/g, '-r'));
	const deletesRepository = /gh\s+repo\s+delete/.test(lowerLine);
	const writesToOtherPath = isApiWriteOutsidePlaceholders(line);
	return namesAddress || namesOtherRepository || deletesRepository || writesToOtherPath;
}

/**
 * Tells whether a line is a writing `gh api` call (-X or --method other than GET, or a field
 * with -f/-F, or --input) whose path is not under `repos/{owner}/{repo}`.
 * @param line - one solution line
 * @returns true when the call could write somewhere else
 */
function isApiWriteOutsidePlaceholders(line: string): boolean {
	if (!/(^|[^a-z0-9_-])gh\s+api\s/i.test(line)) {
		return false;
	}
	// A GraphQL query is sent with -f but only reads; a mutation writes.
	const isGraphQlQuery = /gh\s+api\s+graphql\s/i.test(line) && !/mutation/i.test(line);
	if (isGraphQlQuery) {
		return false;
	}
	const methodMatch = /(?:-X|--method)[\s=]+([A-Za-z]+)/.exec(line);
	const isWrite =
		(methodMatch !== null && methodMatch[1].toUpperCase() !== 'GET') ||
		/\s(-f|-F|--field|--raw-field|--input)\s/.test(line);
	if (!isWrite) {
		return false;
	}
	return !line.includes('repos/{owner}/{repo}');
}
