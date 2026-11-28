import Layout from './Layout';

// Temporary page for screens other people are building.
export default function PlaceholderPage({ title, owner }) {
  return (
    <Layout>
      <h1 className="h1">{title}</h1>
      <p className="muted">Coming soon ({owner} is building this screen).</p>
    </Layout>
  );
}
