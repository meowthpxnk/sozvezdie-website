"use client";

import {
    forwardRef,
    PropsWithChildren,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    LucideProps,
    Mail,
    Phone,
    User,
    UserRound,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import styled from "styled-components";
import { toast } from "sonner";

import { BaseAction } from "@features";
import { authService, useAuth } from "@entities/auth";
import { IAuthForm, IRegisterForm } from "@shared/types/auth.types";
import { restoreSessionAfterAuth } from "@shared/store/clearClientStore";
import { useAppDispatch } from "@shared/store/store";
import { persistAuthorInviteFromSearch, shouldOpenRegisterFromSearch } from "@shared/lib/author-invite";
import { VkIdOneTap } from "@/src/shared/lib/VkIdOneTap";

const AUTH_RADIUS = "12px";
const AUTH_TEXT = "#132647";
const AUTH_BORDER = "var(--search-input-border-color, #d7ddea)";
const AUTH_PLACEHOLDER = "#6b7a90";
const AUTH_ERROR = "var(--cart-stock-warning-color, #c62828)";

type AuthMode = "login" | "register";

const PageRoot = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 100%;
    padding: 32px 16px;
`;

const AuthFormWrapper = styled.form`
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const AuthTitle = styled.h1`
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    text-align: center;
    color: ${AUTH_TEXT};
`;

const FieldsList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const SubmitButton = styled(BaseAction)`
    width: 100%;
    height: 52px;
    border-radius: ${AUTH_RADIUS};
    font-size: 16px;
    font-weight: 600;
    color: #fff;

    &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }
`;

const ModeSwitch = styled.button`
    border: none;
    background: transparent;
    color: var(--main-color, var(--main-color));
    font-size: 15px;
    cursor: pointer;
    text-align: center;
    padding: 0;

    &:hover {
        text-decoration: underline;
    }
`;

const HintText = styled.p`
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: ${AUTH_PLACEHOLDER};
    text-align: center;
`;

const VkAuthLoadingCard = styled.div`
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
`;

const VkAuthSpinner = styled(Loader2)`
    width: 40px;
    height: 40px;
    color: var(--main-color, var(--main-color));
    animation: vk-auth-spin 0.8s linear infinite;

    @keyframes vk-auth-spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

export type TypeLucideImage = React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

export interface WithImageProps {
    Image: TypeLucideImage;
}

export interface InputFieldProps {
    placeholder: string;
    id: string;
    error?: string;
    type?: string;
    name?: string;
}

const FieldWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;

    .error {
        font-size: 13px;
        text-align: center;
        color: ${AUTH_ERROR};
    }
`;

const InputShell = styled.div<{ $hasError?: boolean; $isPassword?: boolean }>`
    position: relative;
    height: 52px;
    border-radius: ${AUTH_RADIUS};
    border: 1px solid ${({ $hasError }) => ($hasError ? AUTH_ERROR : AUTH_BORDER)};
    background: #fff;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus-within {
        border-color: var(--main-color, var(--main-color));
        box-shadow: 0 0 0 3px rgb(79 131 227 / 18%);
    }

    label {
        position: absolute;
        top: 0;
        left: 14px;
        height: 100%;
        display: flex;
        align-items: center;
        pointer-events: none;

        svg {
            width: 20px;
            height: 20px;
            color: ${AUTH_PLACEHOLDER};
            transition: opacity 0.25s, transform 0.25s;
        }
    }

    &:focus-within label svg {
        opacity: 0;
        transform: scale(0.6);
    }

    input {
        width: 100%;
        height: 100%;
        padding: 0 ${({ $isPassword }) => ($isPassword ? "46px" : "16px")} 0 46px;
        border: none;
        background: transparent;
        color: ${AUTH_TEXT};
        font-size: 16px;
        transition: padding 0.25s;

        &::placeholder {
            color: ${AUTH_PLACEHOLDER};
        }

        &:focus {
            padding-left: 16px;
        }
    }
`;

const PasswordToggle = styled.button`
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: ${AUTH_PLACEHOLDER};
    cursor: pointer;
    padding: 0;

    &:hover {
        color: ${AUTH_TEXT};
    }

    svg {
        width: 20px;
        height: 20px;
    }
`;

const Field = forwardRef<HTMLInputElement, InputFieldProps & WithImageProps>(
    ({ Image, id, type, name, placeholder, error, ...rest }, ref) => {
        const isPassword = type === "password";
        const [showPassword, setShowPassword] = useState(false);
        const inputRef = useRef<HTMLInputElement | null>(null);
        const shouldRestoreCursor = useRef(false);
        const inputType = isPassword
            ? showPassword
                ? "text"
                : "password"
            : type;

        const setInputRef = useCallback(
            (node: HTMLInputElement | null) => {
                inputRef.current = node;
                if (typeof ref === "function") {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            },
            [ref]
        );

        useEffect(() => {
            if (!shouldRestoreCursor.current) return;
            shouldRestoreCursor.current = false;
            const input = inputRef.current;
            if (!input) return;

            const placeCursorAtEnd = () => {
                input.focus();
                const length = input.value.length;
                input.setSelectionRange(length, length);
            };

            // Browser resets selection when toggling password/text — wait a frame.
            requestAnimationFrame(() => {
                placeCursorAtEnd();
                requestAnimationFrame(placeCursorAtEnd);
            });
        }, [showPassword]);

        const togglePasswordVisibility = () => {
            shouldRestoreCursor.current = true;
            setShowPassword((prev) => !prev);
        };

        return (
            <FieldWrap>
                <InputShell $hasError={Boolean(error)} $isPassword={isPassword}>
                    <label htmlFor={id}>
                        <Image />
                    </label>
                    <input
                        ref={setInputRef}
                        type={inputType}
                        id={id}
                        placeholder={placeholder}
                        name={name}
                        {...rest}
                    />
                    {isPassword ? (
                        <PasswordToggle
                            type="button"
                            tabIndex={-1}
                            aria-label={
                                showPassword ? "Скрыть пароль" : "Показать пароль"
                            }
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </PasswordToggle>
                    ) : null}
                </InputShell>
                {error ? (
                    <div className="error">
                        <span>{error}</span>
                    </div>
                ) : null}
            </FieldWrap>
        );
    }
);

Field.displayName = "AuthField";

function Heading({ children }: PropsWithChildren) {
    return <AuthTitle>{children}</AuthTitle>;
}

const usernameRules = {
    required: "Укажите имя пользователя",
    minLength: { value: 3, message: "Минимум 3 символа" },
    maxLength: { value: 32, message: "Максимум 32 символа" },
    pattern: {
        value: /^[a-zA-Z0-9_]+$/,
        message: "Только латиница, цифры и _",
    },
} as const;

const passwordRules = {
    required: "Укажите пароль",
    minLength: { value: 8, message: "Минимум 8 символов" },
    validate: {
        uppercase: (value: string) =>
            /[A-Z]/.test(value) || "Нужна заглавная буква",
        lowercase: (value: string) =>
            /[a-z]/.test(value) || "Нужна строчная буква",
        digit: (value: string) => /[0-9]/.test(value) || "Нужна цифра",
    },
} as const;

function getMutationErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        if (typeof detail === "string") {
            return detail;
        }
    }

    return "Не удалось выполнить запрос. Попробуйте ещё раз.";
}

export const AuthPage = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { hasAccessToken, isAuthenticated, authReady } = useAuth();
    const [mode, setMode] = useState<AuthMode>("login");
    const [vkAuthLoading, setVkAuthLoading] = useState(false);

    useEffect(() => {
        persistAuthorInviteFromSearch();
        if (shouldOpenRegisterFromSearch()) {
            setMode("register");
        }
    }, []);

    useEffect(() => {
        if (authReady && hasAccessToken && isAuthenticated) {
            router.replace("/");
        }
    }, [authReady, hasAccessToken, isAuthenticated, router]);

    if (authReady && hasAccessToken && isAuthenticated) {
        return null;
    }

    const loginForm = useForm<IAuthForm>({ mode: "onChange" });
    const registerForm = useForm<IRegisterForm>({ mode: "onChange" });

    const loginMutation = useMutation({
        mutationKey: ["auth", "login"],
        mutationFn: (data: IAuthForm) => authService.authorisate(data),
        async onSuccess() {
            await restoreSessionAfterAuth(dispatch);
            toast.success("Вы вошли в аккаунт");
            router.push("/");
        },
        onError(error) {
            toast.error(getMutationErrorMessage(error));
        },
    });

    const vkAuthMutation = useMutation({
        mutationKey: ["auth", "vk"],
        mutationFn: (payload: {
            code: string;
            deviceId: string;
            codeVerifier: string;
        }) => authService.authoriseVk(payload),
        async onSuccess() {
            await restoreSessionAfterAuth(dispatch);
            toast.success("Вы вошли через VK ID");
            router.push("/");
        },
        onError(error) {
            setVkAuthLoading(false);
            toast.error(getMutationErrorMessage(error));
        },
    });

    const handleVkAuth = useCallback(
        async (payload: {
            code: string;
            deviceId: string;
            codeVerifier: string;
        }) => {
            setVkAuthLoading(true);
            await vkAuthMutation.mutateAsync(payload);
        },
        [vkAuthMutation.mutateAsync]
    );

    const isVkAuthInProgress = vkAuthLoading || vkAuthMutation.isPending;

    const registerMutation = useMutation({
        mutationKey: ["auth", "register"],
        mutationFn: (data: IRegisterForm) => authService.register(data),
        async onSuccess(_data, variables) {
            await authService.authorisate({
                username: variables.username,
                password: variables.password,
            });
            await restoreSessionAfterAuth(dispatch);
            toast.success("Регистрация прошла успешно");
            router.push("/");
        },
        onError(error) {
            toast.error(getMutationErrorMessage(error));
        },
    });

    const switchMode = (nextMode: AuthMode) => {
        setMode(nextMode);
        loginForm.reset();
        registerForm.reset();
    };

    const onLoginSubmit: SubmitHandler<IAuthForm> = (data) => {
        loginMutation.mutate(data);
    };

    const onRegisterSubmit: SubmitHandler<IRegisterForm> = (data) => {
        registerMutation.mutate({
            ...data,
            username: data.username.trim().toLowerCase(),
            last_name: data.last_name.trim(),
            first_name: data.first_name.trim(),
            patronymic: data.patronymic?.trim() || undefined,
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
        });
    };

    const isPending =
        loginMutation.isPending ||
        registerMutation.isPending ||
        vkAuthMutation.isPending;

    if (mode === "register") {
        const { register, handleSubmit, formState } = registerForm;

        return (
            <PageRoot>
                <AuthFormWrapper onSubmit={handleSubmit(onRegisterSubmit)}>
                    <Heading>Регистрация</Heading>
                    <FieldsList>
                        <li>
                            <Field
                                placeholder="Фамилия"
                                id="last_name"
                                Image={User}
                                error={formState.errors.last_name?.message}
                                {...register("last_name", {
                                    required: "Укажите фамилию",
                                    minLength: {
                                        value: 1,
                                        message: "Укажите фамилию",
                                    },
                                })}
                            />
                        </li>
                        <li>
                            <Field
                                placeholder="Имя"
                                id="first_name"
                                Image={User}
                                error={formState.errors.first_name?.message}
                                {...register("first_name", {
                                    required: "Укажите имя",
                                    minLength: {
                                        value: 1,
                                        message: "Укажите имя",
                                    },
                                })}
                            />
                        </li>
                        <li>
                            <Field
                                placeholder="Отчество"
                                id="patronymic"
                                Image={User}
                                error={formState.errors.patronymic?.message}
                                {...register("patronymic")}
                            />
                        </li>
                        <li>
                            <Field
                                placeholder="Имя пользователя"
                                id="reg-username"
                                Image={UserRound}
                                error={formState.errors.username?.message}
                                {...register("username", usernameRules)}
                            />
                        </li>
                        <li>
                            <Field
                                placeholder="Пароль"
                                id="reg-password"
                                type="password"
                                Image={KeyRound}
                                error={formState.errors.password?.message}
                                {...register("password", passwordRules)}
                            />
                        </li>
                        <li>
                            <Field
                                placeholder="Телефон"
                                id="phone"
                                type="tel"
                                Image={Phone}
                                error={formState.errors.phone?.message}
                                {...register("phone", {
                                    required: "Укажите телефон",
                                    minLength: {
                                        value: 5,
                                        message: "Минимум 5 символов",
                                    },
                                    maxLength: {
                                        value: 32,
                                        message: "Максимум 32 символа",
                                    },
                                })}
                            />
                        </li>
                        <li>
                            <Field
                                placeholder="Электронная почта"
                                id="email"
                                type="email"
                                Image={Mail}
                                error={formState.errors.email?.message}
                                {...register("email", {
                                    required: "Укажите почту",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Некорректный email",
                                    },
                                })}
                            />
                        </li>
                    </FieldsList>
                    <HintText>
                        Пароль: от 8 символов, заглавная и строчная буква, цифра.
                        Логин — латиница, цифры и _.
                    </HintText>
                    <SubmitButton type="submit" disabled={isPending}>
                        {registerMutation.isPending
                            ? "Регистрация..."
                            : "Зарегистрироваться"}
                    </SubmitButton>
                    <ModeSwitch type="button" onClick={() => switchMode("login")}>
                        Уже есть аккаунт? Войти
                    </ModeSwitch>
                </AuthFormWrapper>
            </PageRoot>
        );
    }

    const { register, handleSubmit, formState } = loginForm;

    if (isVkAuthInProgress) {
        return (
            <PageRoot>
                <VkAuthLoadingCard>
                    <VkAuthSpinner aria-hidden />
                    <AuthTitle>Вход через VK ID</AuthTitle>
                    <HintText>Подождите, выполняем авторизацию…</HintText>
                </VkAuthLoadingCard>
            </PageRoot>
        );
    }

    return (
        <PageRoot>
            <AuthFormWrapper onSubmit={handleSubmit(onLoginSubmit)}>
                <Heading>Авторизация</Heading>
                <FieldsList>
                    <li>
                        <Field
                            placeholder="Имя пользователя"
                            id="username"
                            Image={UserRound}
                            error={formState.errors.username?.message}
                            {...register("username", {
                                required: "Укажите имя пользователя",
                            })}
                        />
                    </li>
                    <li>
                        <Field
                            placeholder="Пароль"
                            id="password"
                            type="password"
                            Image={KeyRound}
                            error={formState.errors.password?.message}
                            {...register("password", {
                                required: "Укажите пароль",
                            })}
                        />
                    </li>
                </FieldsList>
                <SubmitButton type="submit" disabled={isPending}>
                    {loginMutation.isPending ? "Вход..." : "Войти"}
                </SubmitButton>
                <VkIdOneTap
                    onVkAuth={handleVkAuth}
                    onLoadingChange={setVkAuthLoading}
                    onError={() => setVkAuthLoading(false)}
                />
                <ModeSwitch type="button" onClick={() => switchMode("register")}>
                    Зарегистрироваться
                </ModeSwitch>
            </AuthFormWrapper>
        </PageRoot>
    );
};
