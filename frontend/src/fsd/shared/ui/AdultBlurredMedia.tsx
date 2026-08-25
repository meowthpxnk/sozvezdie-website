"use client";

import type { ReactNode } from "react";

type AdultBlurredMediaProps = {
    blurred: boolean;
    className?: string;
    children: ReactNode;
};

export function AdultBlurredMedia({
    blurred,
    className,
    children,
}: AdultBlurredMediaProps) {
    const classes = ["pos-r", "ov-h", "fill"];
    if (className) {
        classes.push(className);
    }
    if (blurred) {
        classes.push("adult-blur-media");
    }

    return (
        <div className={classes.join(" ")}>
            {children}
            {blurred ? (
                <span className="adult-blur-badge" aria-hidden>
                    18+
                </span>
            ) : null}
        </div>
    );
}
