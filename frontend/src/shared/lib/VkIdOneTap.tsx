"use client";

import { useEffect, useRef } from "react";

import {
    Config,
    ConfigResponseMode,
    ConfigSource,
    OneTap,
    OneTapInternalEvents,
    WidgetEvents,
} from "@vkid/sdk";

import { VKID_APP_ID, VKID_REDIRECT_URL } from "@shared/config/public-env";

import { generateCodeVerifier } from "./vk-code-verifier";

export type VkAuthorisePayload = {
    code: string;
    deviceId: string;
    codeVerifier: string;
};

type VkLoginPayload = {
    code: string;
    device_id: string;
};

type VkIdOneTapProps = {
    onVkAuth: (payload: VkAuthorisePayload) => Promise<void>;
    onError?: (error: unknown) => void;
    onLoadingChange?: (loading: boolean) => void;
};

export function VkIdOneTap({
    onVkAuth,
    onError,
    onLoadingChange,
}: VkIdOneTapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const codeVerifierRef = useRef<string>(generateCodeVerifier());
    const isLoadingRef = useRef(false);
    const onLoadingChangeRef = useRef(onLoadingChange);
    const onVkAuthRef = useRef(onVkAuth);
    const onErrorRef = useRef(onError);

    onVkAuthRef.current = onVkAuth;
    onErrorRef.current = onError;
    onLoadingChangeRef.current = onLoadingChange;

    const setLoading = (loading: boolean) => {
        isLoadingRef.current = loading;
        onLoadingChangeRef.current?.(loading);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        Config.init({
            app: VKID_APP_ID,
            redirectUrl: VKID_REDIRECT_URL,
            responseMode: ConfigResponseMode.Callback,
            source: ConfigSource.LOWCODE,
            scope: "",
            codeVerifier: codeVerifierRef.current,
        });

        const oneTap = new OneTap();

        oneTap
            .render({
                container,
                fastAuthEnabled: false,
            })
            .on(WidgetEvents.ERROR, (error: unknown) => {
                onErrorRef.current?.(error);
            })
            .on(OneTapInternalEvents.LOGIN_SUCCESS, (payload: VkLoginPayload) => {
                if (isLoadingRef.current) return;

                setLoading(true);

                void onVkAuthRef
                    .current({
                        code: payload.code,
                        deviceId: payload.device_id,
                        codeVerifier: codeVerifierRef.current,
                    })
                    .catch((error: unknown) => {
                        setLoading(false);
                        onErrorRef.current?.(error);
                    });
            });

        return () => {
            container.innerHTML = "";
        };
    }, []);

    return <div ref={containerRef} id="VkIdSdkOneTap" />;
}
