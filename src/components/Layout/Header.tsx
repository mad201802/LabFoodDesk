import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { getUsernameLetters } from "~/helper/generalFunctions"
import { MenueIcon } from "../Icons/MenueIcon"
import { Balance } from "../General/Balance"
import { api } from "~/utils/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"

export default function Header() {
  const { data: sessionData } = useSession()
  const { setTheme } = useTheme()

  const loggedIn = !!sessionData?.user
  const { data: userData, isLoading: userIsLoading } = api.user.getMe.useQuery(undefined, {
    enabled: loggedIn,
  })

  const navElements = () => (
    <>
      <li>
        <Link href="/buy">Kaufen</Link>
      </li>
      <li>
        <Link href="/grouporders">Gruppen-Kauf</Link>
      </li>
      <li>
        <Link href="/split">Split</Link>
      </li>
      <li>
        <Link href="/top-up">Aufladen</Link>
      </li>
      <li>
        <Link href="/account">Konto</Link>
      </li>
      {sessionData?.user.is_admin && (
        <li>
          <details
            tabIndex={0}
            onBlur={(e) => {
              const target = e.currentTarget
              setTimeout(function () {
                target.open = false
              }, 300)
            }}
          >
            <summary tabIndex={0}>Admin</summary>
            <ul className="z-[100] bg-background">
              <li>
                <Link href="/admin/inventory">Inventar</Link>
              </li>
              <li>
                <Link href="/admin/grouporders">Gruppenbestellungen</Link>
              </li>
              <li>
                <Link href="/admin/categories">Kategorien</Link>
              </li>
              <li>
                <Link href="/admin/clearingAccounts">Verrechnungskonten</Link>
              </li>
              <li>
                <Link href="/admin/users">User-Verwaltung</Link>
              </li>
            </ul>
          </details>
        </li>
      )}
    </>
  )

  return (
    <div className="navbar">
      {loggedIn && (
        <>
          <div className="navbar-start">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side={"left"}>
                <SheetHeader>
                  <SheetTitle>Menü</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <ul className="menu menu-vertical">{navElements()}</ul>
                </div>
              </SheetContent>
            </Sheet>
            <Link className="btn btn-ghost text-xl font-extrabold tracking-tight" href="/">
              Lab Eats
            </Link>
          </div>

          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">{navElements()}</ul>
          </div>
        </>
      )}

      {/* UserAccount-Icon (top right) */}
      {loggedIn && (
        <div className="navbar-end">
          <div className="text-sm font-thin">
            <Balance balance={userData?.balance} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="ml-3">
              <Avatar>
                <AvatarImage
                  src={sessionData?.user?.image ?? undefined}
                  alt={sessionData?.user?.name ?? undefined}
                />
                <AvatarFallback>{getUsernameLetters(sessionData?.user?.name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Mein Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/me">Profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a onClick={() => void signOut({ callbackUrl: "/" })}>Ausloggen</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex w-full items-center justify-center">
                      <Button variant="outline" size="icon">
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                      </Button>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
