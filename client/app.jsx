import React from 'react';
import Home from './pages/home';
import AuthPage from './pages/auth';
import DeckCards from './pages/deck-cards';
import StudyCards from './pages/study-cards';
import Navigation from './components/navbar';
import PageContainer from './components/page-container';
import 'bootstrap-icons/font/bootstrap-icons.css';
import parseRoute from './lib/parse-route';
import AppContext from './lib/app-context';
import jwtDecode from 'jwt-decode';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      token: 'undefined',
      isAuthorizing: true,
      route: parseRoute(window.location.hash)
    };
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  componentDidMount() {
    window.addEventListener('hashchange', () => {
      this.setState({
        route: parseRoute(window.location.hash)
      });
    });
    const token = window.localStorage.getItem('deck-study-jwt');
    const user = token ? jwtDecode(token) : null;
    this.setState({ user, token, isAuthorizing: false });
  }

  handleSignIn(result) {
    const { user, token } = result;
    window.localStorage.setItem('deck-study-jwt', token);
    this.setState({ user, token });
  }

  handleSignOut() {
    window.localStorage.removeItem('deck-study-jwt');
    this.setState({ user: null, token: null });
  }

  renderPage() {
    const { user, token, route } = this.state;

    if (route.path === '') {
      return <Home user={user} token={token}/>;
    }

    if (route.path === 'sign-in' || route.path === 'sign-up') {
      return <AuthPage />;
    }

    if (route.path === 'deck-cards') {
      const deckId = route.params.get('deckId');
      const tab = route.params.get('tab');
      const cardIndex = parseInt(route.params.get('cardIndex') ?? '0');

      return <DeckCards deckId={deckId} tab={tab} token={token} cardIndex={cardIndex}/>;
    }

    if (route.path === 'study-cards') {
      const deckId = route.params.get('deckId');
      return <StudyCards deckId={deckId} token={token} />;
    }
  }

  render() {
    if (this.state.isAuthorizing) return null;
    const { user, route } = this.state;
    const { handleSignIn } = this;
    const contextValue = { user, route, handleSignIn };
    return (
      <AppContext.Provider value={contextValue}>
        <>
          <Navigation onSignOut={this.handleSignOut}/>
          <PageContainer>
            {this.renderPage()}
          </PageContainer>
        </>
      </AppContext.Provider>
    );
  }
}
