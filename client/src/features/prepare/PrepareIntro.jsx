import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'

function PrepareIntro() {
  return (
    <Layout>
      <section className="prepare-intro">
        <h2>Prepare</h2>

        <p>
          Create an emergency plan, pack your emergency
          kit and save important contacts.
        </p>

        <p>Sign in to save your preparedness progress.</p>

        <Link to="/login" className="intro-signin">
          Sign in
        </Link>

        <Link to="/signup" className="intro-signup">
          Create account
        </Link>
      </section>
    </Layout>
  )
}

export default PrepareIntro