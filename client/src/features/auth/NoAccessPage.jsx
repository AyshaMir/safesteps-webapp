import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function NoAccessPage() {
  return (
    <Layout>
      <div className="center-message">
        <span className="bang bang--xl" aria-hidden="true">!</span>
        <h1 className="h1">You don&apos;t have access</h1>
        <p className="lead">This page is only for SafeSteps admins.</p>
        <Link to="/" className="btn btn--primary">
          Go to Home
        </Link>
      </div>
    </Layout>
  );
}
