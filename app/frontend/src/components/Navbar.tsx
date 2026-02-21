// "use client"

import {
	NavigationMenu,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

export function Navbar() {
	return (
		<nav className="w-full border-b bg-background">
			<div className="flex h-16 items-center px-4 max-w-7xl mx-auto justify-between">
				<div className="font-bold text-xl">Book Fuel</div>
				<NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}>
							Dashboard
						</NavigationMenuLink>
						<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}>
							Tasks
						</NavigationMenuLink>
						<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}>
							Profile
						</NavigationMenuLink>
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</nav>
	)
}