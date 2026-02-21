// "use client"

import {
	NavigationMenu,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

interface NavbarProps {
	currentView: 'dashboard' | 'profile';
	setCurrentView: (view: 'dashboard' | 'profile') => void;
}

export function Navbar({ currentView, setCurrentView }: NavbarProps) {
	return (
		<nav className="w-full border-b bg-background">
			<div className="flex h-16 items-center px-4 max-w-7xl mx-auto justify-between">
				<div className="font-bold text-xl">Book Fuel</div>
				<NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuLink
							className={cn(navigationMenuTriggerStyle(), "cursor-pointer", currentView === 'dashboard' && "bg-accent")}
							onClick={() => setCurrentView('dashboard')}
						>
							Dashboard
						</NavigationMenuLink>
						<NavigationMenuLink
							className={cn(navigationMenuTriggerStyle(), "cursor-pointer", currentView === 'profile' && "bg-accent")}
							onClick={() => setCurrentView('profile')}
						>
							Profile
						</NavigationMenuLink>
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</nav>
	)
}