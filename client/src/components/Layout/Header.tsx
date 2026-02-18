import type { MouseEvent } from "react"
import type { AppRoute, NavLinkItem, Theme } from "../../types/domain"
import { Toggle } from "../UI/Toggle"

interface HeaderProps {
  theme: Theme
  navItems: NavLinkItem[]
  currentPath: AppRoute
  onNavigate: (path: AppRoute) => void
  onToggleTheme: () => void
}

export const Header = ({ theme, navItems, currentPath, onNavigate, onToggleTheme }: HeaderProps) => {
  // Перехватываем обычный клик, чтобы навигация была SPA без перезагрузки.
  // При модификаторах (cmd/ctrl/shift) не мешаем стандартному поведению браузера.
  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, path: AppRoute) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return
    }

    event.preventDefault()
    onNavigate(path)
  }

  return (
    <header className="site-header">
      <div className="brand-block">
        <p className="brand-chip">Валютный центр</p>
        <h1>Конвертер валют</h1>
        <p className="brand-subtitle">Актуальные курсы, локальный кэш и история конвертаций.</p>
      </div>

      <nav aria-label="Разделы сайта" className="site-nav">
        {navItems.map((item) => {
          // Подсветка активного раздела в хедере.
          const isActive = currentPath === item.path

          return (
            <a
              key={item.path}
              href={item.path}
              className={`nav-link ${isActive ? "is-active" : ""}`.trim()}
              aria-label={`Перейти к разделу ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              onClick={(event) => handleNavClick(event, item.path)}
            >
              {item.label}
            </a>
          )
        })}
      </nav>

      <Toggle checked={theme === "dark"} onToggle={onToggleTheme} label="Переключить тему приложения" />
    </header>
  )
}
