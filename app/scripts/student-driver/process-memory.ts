/**
 * process-memory.ts
 * Measures how much memory the app uses on Windows: the app's own process plus every
 * process it started (the WebView2 browser, renderer and helper processes).
 * Reads the process list once through PowerShell's Get-CimInstance.
 */

import { execFileSync } from 'node:child_process';

/** One process as Windows lists it. */
type ProcessEntry = {
	ProcessId: number;
	ParentProcessId: number;
	Name: string;
	WorkingSetSize: number;
	PrivatePageCount: number;
};

/** Memory of the app and its child processes, in megabytes. */
export type MemoryReport = {
	processCount: number;
	workingSetMegabytes: number;
	privateMegabytes: number;
	byProcess: { name: string; workingSetMegabytes: number }[];
};

/**
 * Measures the memory of a process and all its descendants.
 * @param rootProcessId - the app's process ID
 * @returns the totals and a per-process list
 */
export function measureProcessTree(rootProcessId: number): MemoryReport {
	const allProcesses = listProcesses();
	const treeProcesses = collectDescendants(allProcesses, rootProcessId);
	const megabyte = 1024 * 1024;
	let workingSetBytes = 0;
	let privateBytes = 0;
	for (const entry of treeProcesses) {
		workingSetBytes += entry.WorkingSetSize;
		privateBytes += entry.PrivatePageCount;
	}
	return {
		processCount: treeProcesses.length,
		workingSetMegabytes: Math.round(workingSetBytes / megabyte),
		privateMegabytes: Math.round(privateBytes / megabyte),
		byProcess: treeProcesses.map((entry) => ({
			name: entry.Name,
			workingSetMegabytes: Math.round(entry.WorkingSetSize / megabyte)
		}))
	};
}

/**
 * Lists every running process with its parent and memory.
 * Input: none. Output: the process list.
 */
function listProcesses(): ProcessEntry[] {
	const command =
		'Get-CimInstance Win32_Process | ' +
		'Select-Object ProcessId,ParentProcessId,Name,WorkingSetSize,PrivatePageCount | ' +
		'ConvertTo-Json -Compress';
	const output = execFileSync('powershell.exe', ['-NoProfile', '-Command', command], {
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024
	});
	return JSON.parse(output) as ProcessEntry[];
}

/**
 * Picks a process and everything it started, at any depth.
 * @param allProcesses - every running process
 * @param rootProcessId - where the tree starts
 * @returns the root and its descendants
 */
function collectDescendants(allProcesses: ProcessEntry[], rootProcessId: number): ProcessEntry[] {
	const found: ProcessEntry[] = [];
	const idsToVisit = [rootProcessId];
	while (idsToVisit.length > 0) {
		const currentId = idsToVisit.pop();
		for (const entry of allProcesses) {
			if (entry.ProcessId === currentId) {
				found.push(entry);
			}
			if (entry.ParentProcessId === currentId && entry.ProcessId !== currentId) {
				idsToVisit.push(entry.ProcessId);
			}
		}
	}
	return found;
}
