"use client"

import React from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

export default function BreadcrumbLayout() {
    const pathname = usePathname()
    const pathSegments = pathname?.split('/').filter(segment => segment !== '')

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/home">
                        Home
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {pathSegments?.slice(1).map((segment, index) => (
                    <React.Fragment key={`fragment-${index}`}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                        
                        <BreadcrumbLink href={`/${pathSegments.slice(0, index + 2).join('/')}`}>
                            {segment}
                        </BreadcrumbLink>
                </BreadcrumbItem>
            </React.Fragment>
        ))}
     </BreadcrumbList>
    </Breadcrumb>
    )
}