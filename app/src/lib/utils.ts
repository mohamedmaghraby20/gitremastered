/**
 * utils.ts
 * Small helpers shared by the shadcn-svelte building blocks.
 * cn() joins class names and lets a later Tailwind class win over an earlier one,
 * e.g. cn('px-2', 'px-4') gives 'px-4'.
 */

export { cn } from 'cn';
