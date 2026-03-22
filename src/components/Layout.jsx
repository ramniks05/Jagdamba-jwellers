import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import Header from './Header'
import CategoriesBar from './CategoriesBar'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'

export default function Layout() {
  return (
    <>
      <TopBar />
      <Header />
      <CategoriesBar />
      <main className="layout-main layout-main--app">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  )
}
