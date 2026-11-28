import Layout from './Layout';

// Grey placeholder blocks shaped like content.
export default function LoadingPage() {
  return (
    <Layout>
      <div className="skeleton" aria-busy="true" aria-label="Loading">
        <div className="skeleton__block skeleton__block--title" />
        <div className="skeleton__block" />
        <div className="skeleton__block" />
        <div className="skeleton__block skeleton__block--short" />
      </div>
    </Layout>
  );
}
