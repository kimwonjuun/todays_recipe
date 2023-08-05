import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from '../pages/Main';
import Search from '../pages/Search';
import Recipe from '../pages/Recipe';
import Detail from '../pages/Detail';
import My from '../pages/My';
import Admin from '../pages/Admin';
import ErrorPage from '../pages/ErrorPage';
import Header from '../components/layout/Header';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';

const Router = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/search/:keyword" element={<Search />} />
        <Route path="/recipe" element={<Recipe />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/my" element={<My />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <ScrollToTopButton />
    </BrowserRouter>
  );
};

export default Router;
