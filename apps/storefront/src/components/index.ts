// Barrel file for components following atomic design
// Currently we only export organisms (which contain the Header).
// Add atoms/molecules/templates exports here when those folders contain real exports.
export * from './organisms';

// Provide a default Header re-export for compatibility
export { default as Header } from './organisms/Header';
// Default export for legacy `import Header from '../components'` usage
export { default } from './organisms/Header';
