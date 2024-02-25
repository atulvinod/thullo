import './App.css';
import { Route, Routes } from 'react-router-dom';
import { AppRoot } from './lib/components/root/root.component';
import BoardsPage from './lib/pages/boards/boards.page';
import { RegisterPage } from './lib/pages/user/register/register.page';
import { LoginPage } from './lib/pages/user/login/login.page';
import AllBoardsPage from './lib/pages/all-boards/allboards.page';

function App() {
  document.title = 'Thullo';
  return (
    <Routes>
      <Route path='/' element={<AppRoot />}>
        <Route index element={<AllBoardsPage />} />
        <Route path='/boards/:board_id' element={<BoardsPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
