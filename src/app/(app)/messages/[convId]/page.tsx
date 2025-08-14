
// This page now simply re-exports the main messages page component.
// This allows both /messages and /messages/[convId] to use the same logic,
// with the [convId] page passing its `params` to the shared component.
export { default } from '../page';
