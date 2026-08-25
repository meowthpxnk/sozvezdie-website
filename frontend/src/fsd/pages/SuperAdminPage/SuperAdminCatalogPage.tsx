"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Category } from "@entities/category/category";
import type { Fandom } from "@entities/fandom/fandom";
import { superAdminService } from "@entities/super-admin";
import type { Subcategory } from "@entities/subcategory/subcategory";
import { isValidSlug, translitToSlug } from "@shared/lib/slug";
import { IconActionButton } from "@/src/shared/ui/icon-action-button";
import { SetAdminChrome } from "@widgets/AdminShell";

type CatalogTab = "fandoms" | "categories" | "subcategories";

const Card = styled.section`
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 8px 24px rgba(17, 31, 60, 0.05);
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Tabs = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`;

const TabButton = styled.button<{ $active: boolean }>`
    min-height: 36px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid ${({ $active }) => ($active ? "var(--main-color)" : "#d7ddea")};
    background: ${({ $active }) => ($active ? "var(--main-color)" : "#fff")};
    color: ${({ $active }) => ($active ? "#fff" : "#2d3a54")};
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
`;

const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #2d3a54;
`;

const Input = styled.input`
    min-height: 40px;
    border-radius: 8px;
    border: 1px solid #d7ddea;
    padding: 0 12px;
    font-size: 14px;
    color: #132647;
`;

const Select = styled.select`
    min-height: 40px;
    border-radius: 8px;
    border: 1px solid #d7ddea;
    padding: 0 12px;
    font-size: 14px;
    color: #132647;
    background: #fff;
`;

const CheckboxRow = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #2d3a54;
    cursor: pointer;
`;

const SearchInput = styled(Input)`
    min-height: 42px;
    border-radius: 10px;
`;

const PrimaryButton = styled.button`
    min-height: 42px;
    padding: 0 18px;
    border: none;
    border-radius: 10px;
    background: var(--main-color);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EditButton = styled(IconActionButton).attrs({ $active: true })``;

const DeleteButton = styled(IconActionButton).attrs({ $active: true })`
    background: #dc3545;
    border-color: #dc3545;
    color: #fff;

    &:hover {
        background: #c82333;
        border-color: #c82333;
    }
`;

const ItemList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const ItemRow = styled.li`
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f6f7f9;
    border-radius: 10px;
    padding: 12px 14px;
`;

const ItemMain = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ItemTitle = styled.span`
    font-size: 15px;
    font-weight: 600;
    color: #1f2430;
    line-height: 1.35;
`;

const ItemMeta = styled.span`
    font-size: 12px;
    color: #8b97ab;
`;

const Badge = styled.span<{ $tone: "ok" | "warn" }>`
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    background: ${({ $tone }) => ($tone === "ok" ? "#e8f6ee" : "#fff4e5")};
    color: ${({ $tone }) => ($tone === "ok" ? "#1f7a45" : "#a35b00")};
`;

const SideActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
`;

const EmptyState = styled.p`
    margin: 0;
    font-size: 14px;
    color: #6b7890;
`;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
    display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
    position: fixed;
    inset: 0;
    z-index: 1200;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(17, 31, 60, 0.45);
`;

const ModalCard = styled.div`
    width: min(560px, 100%);
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 16px 40px rgba(17, 31, 60, 0.18);
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    color: #132647;
`;

const ModalCloseButton = styled.button`
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: #eef1f6;
    color: #4a5872;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const ModalActions = styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
`;

const AddButton = styled.button`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: var(--main-color);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    appearance: none;

    &:hover {
        background: var(--main-color-hover);
    }

    &:focus-visible {
        outline: 2px solid var(--main-color);
        outline-offset: 2px;
    }

    svg {
        width: 14px;
        height: 14px;
    }
`;

const FiltersRow = styled.div`
    display: grid;
    gap: 10px;

    @media (min-width: 720px) {
        grid-template-columns: 1fr minmax(180px, 240px);
    }
`;

type TaxonomyFormState = {
    title: string;
    slug: string;
    categorySlug: string;
    isApproved: boolean;
};

const emptyForm = (): TaxonomyFormState => ({
    title: "",
    slug: "",
    categorySlug: "",
    isApproved: true,
});

function syncSlugFromTitle(
    form: TaxonomyFormState,
    title: string,
    slugLocked: boolean
): TaxonomyFormState {
    if (slugLocked) {
        return { ...form, title };
    }
    return {
        ...form,
        title,
        slug: translitToSlug(title),
    };
}

type FormModalProps = {
    isOpen: boolean;
    title: string;
    form: TaxonomyFormState;
    isPending: boolean;
    submitLabel: string;
    mode: CatalogTab;
    isEdit: boolean;
    categories: Category[];
    onClose: () => void;
    onSubmit: () => void;
    onChange: (next: TaxonomyFormState) => void;
};

function TaxonomyFormModal({
    isOpen,
    title,
    form,
    isPending,
    submitLabel,
    mode,
    isEdit,
    categories,
    onClose,
    onSubmit,
    onChange,
}: FormModalProps) {
    return (
        <ModalOverlay $isOpen={isOpen} onClick={onClose}>
            <ModalCard onClick={(event) => event.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>{title}</ModalTitle>
                    <ModalCloseButton type="button" aria-label="Закрыть" onClick={onClose}>
                        <X size={16} />
                    </ModalCloseButton>
                </ModalHeader>

                {mode === "subcategories" && !isEdit ? (
                    <Field>
                        Категория
                        <Select
                            value={form.categorySlug}
                            onChange={(event) =>
                                onChange({ ...form, categorySlug: event.target.value })
                            }
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map((category) => (
                                <option key={category.slug} value={category.slug}>
                                    {category.title}
                                </option>
                            ))}
                        </Select>
                    </Field>
                ) : null}

                <Field>
                    Название
                    <Input
                        value={form.title}
                        onChange={(event) =>
                            onChange(syncSlugFromTitle(form, event.target.value, isEdit))
                        }
                        placeholder="Название"
                    />
                </Field>

                {!isEdit ? (
                    <Field>
                        Адрес в ссылке
                        <Input
                            value={form.slug}
                            onChange={(event) =>
                                onChange({ ...form, slug: event.target.value })
                            }
                            placeholder="garri-potter"
                        />
                    </Field>
                ) : null}

                {mode === "fandoms" || mode === "subcategories" ? (
                    <CheckboxRow>
                        <input
                            type="checkbox"
                            checked={form.isApproved}
                            onChange={(event) =>
                                onChange({ ...form, isApproved: event.target.checked })
                            }
                        />
                        Одобрен
                    </CheckboxRow>
                ) : null}

                <ModalActions>
                    <PrimaryButton type="button" disabled={isPending} onClick={onSubmit}>
                        {submitLabel}
                    </PrimaryButton>
                </ModalActions>
            </ModalCard>
        </ModalOverlay>
    );
}

export function SuperAdminCatalogPage() {
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<CatalogTab>("fandoms");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState<TaxonomyFormState>(emptyForm);
    const [editingFandom, setEditingFandom] = useState<Fandom | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(
        null
    );
    const [editForm, setEditForm] = useState<TaxonomyFormState>(emptyForm);

    const trimmedSearch = search.trim();

    useEffect(() => {
        setSearch("");
        setCategoryFilter("");
        setCreateModalOpen(false);
        setEditingFandom(null);
        setEditingCategory(null);
        setEditingSubcategory(null);
        setCreateForm(emptyForm());
        setEditForm(emptyForm());
    }, [tab]);

    const categoriesQuery = useQuery({
        queryKey: ["super-admin", "categories", ""],
        queryFn: () => superAdminService.getCategories(),
    });

    const fandomsQuery = useQuery({
        queryKey: ["super-admin", "fandoms", trimmedSearch],
        queryFn: () => superAdminService.getFandoms(trimmedSearch || undefined),
        enabled: tab === "fandoms",
    });

    const categoriesListQuery = useQuery({
        queryKey: ["super-admin", "categories", trimmedSearch],
        queryFn: () => superAdminService.getCategories(trimmedSearch || undefined),
        enabled: tab === "categories",
    });

    const subcategoriesQuery = useQuery({
        queryKey: [
            "super-admin",
            "subcategories",
            trimmedSearch,
            categoryFilter,
        ],
        queryFn: () =>
            superAdminService.getSubcategories({
                search: trimmedSearch || undefined,
                categorySlug: categoryFilter || undefined,
            }),
        enabled: tab === "subcategories",
    });

    const categories = categoriesQuery.data ?? [];
    const categoryTitleBySlug = useMemo(() => {
        const map = new Map<string, string>();
        for (const category of categories) {
            map.set(category.slug, category.title);
        }
        return map;
    }, [categories]);

    const invalidateTaxonomy = async () => {
        await queryClient.invalidateQueries({ queryKey: ["super-admin", "fandoms"] });
        await queryClient.invalidateQueries({ queryKey: ["super-admin", "categories"] });
        await queryClient.invalidateQueries({ queryKey: ["super-admin", "subcategories"] });
        await queryClient.invalidateQueries({ queryKey: ["fandoms"] });
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
        await queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    };

    const createMutation = useMutation({
        mutationFn: async () => {
            const title = createForm.title.trim();
            const slug = createForm.slug.trim().toLowerCase();
            if (!title || !slug) {
                throw new Error("Заполните название и адрес в ссылке");
            }
            if (!isValidSlug(slug)) {
                throw new Error("Некорректный адрес в ссылке");
            }

            if (tab === "fandoms") {
                return superAdminService.createFandom({
                    title,
                    slug,
                    isApproved: createForm.isApproved,
                });
            }
            if (tab === "categories") {
                return superAdminService.createCategory({ title, slug });
            }
            if (!createForm.categorySlug) {
                throw new Error("Выберите категорию");
            }
            return superAdminService.createSubcategory({
                title,
                slug,
                categorySlug: createForm.categorySlug,
                isApproved: createForm.isApproved,
            });
        },
        onSuccess: async () => {
            setCreateModalOpen(false);
            setCreateForm(emptyForm());
            await invalidateTaxonomy();
            toast.success("Создано");
        },
        onError: (error) => {
            const message =
                error instanceof Error &&
                (error.message === "Заполните название и адрес в ссылке" ||
                    error.message === "Некорректный адрес в ссылке" ||
                    error.message === "Выберите категорию")
                    ? error.message
                    : "Не удалось создать";
            toast.error(message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            const title = editForm.title.trim();
            if (!title) {
                throw new Error("Укажите название");
            }

            if (editingFandom) {
                return superAdminService.updateFandom(editingFandom.slug, {
                    title,
                    isApproved: editForm.isApproved,
                });
            }
            if (editingCategory) {
                return superAdminService.updateCategory(editingCategory.slug, { title });
            }
            if (editingSubcategory) {
                return superAdminService.updateSubcategory(editingSubcategory.id, {
                    title,
                    isApproved: editForm.isApproved,
                });
            }
            throw new Error("Элемент не выбран");
        },
        onSuccess: async () => {
            setEditingFandom(null);
            setEditingCategory(null);
            setEditingSubcategory(null);
            setEditForm(emptyForm());
            await invalidateTaxonomy();
            toast.success("Сохранено");
        },
        onError: (error) => {
            const message =
                error instanceof Error && error.message === "Укажите название"
                    ? error.message
                    : "Не удалось сохранить";
            toast.error(message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (payload: {
            kind: CatalogTab;
            key: string | number;
        }) => {
            if (payload.kind === "fandoms") {
                return superAdminService.deleteFandom(String(payload.key));
            }
            if (payload.kind === "categories") {
                return superAdminService.deleteCategory(String(payload.key));
            }
            return superAdminService.deleteSubcategory(Number(payload.key));
        },
        onSuccess: async () => {
            await invalidateTaxonomy();
            toast.success("Удалено");
        },
        onError: () => toast.error("Не удалось удалить"),
    });

    const openCreateModal = () => {
        setCreateForm(emptyForm());
        setCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        if (createMutation.isPending) {
            return;
        }
        setCreateModalOpen(false);
        setCreateForm(emptyForm());
    };

    const closeEditModal = () => {
        if (updateMutation.isPending) {
            return;
        }
        setEditingFandom(null);
        setEditingCategory(null);
        setEditingSubcategory(null);
        setEditForm(emptyForm());
    };

    const titleRight = useMemo(
        () => (
            <AddButton type="button" aria-label="Добавить" onClick={openCreateModal}>
                <Plus aria-hidden />
            </AddButton>
        ),
        []
    );

    const createModalTitle =
        tab === "fandoms"
            ? "Новый фандом"
            : tab === "categories"
              ? "Новая категория"
              : "Новая подкатегория";

    const editModalTitle =
        tab === "fandoms"
            ? "Редактирование фандома"
            : tab === "categories"
              ? "Редактирование категории"
              : "Редактирование подкатегории";

    const isEditOpen =
        editingFandom !== null || editingCategory !== null || editingSubcategory !== null;

    const itemsLoading =
        (tab === "fandoms" && fandomsQuery.isLoading) ||
        (tab === "categories" && categoriesListQuery.isLoading) ||
        (tab === "subcategories" && subcategoriesQuery.isLoading);

    const fandoms = fandomsQuery.data ?? [];
    const categoriesList = categoriesListQuery.data ?? [];
    const subcategories = subcategoriesQuery.data ?? [];
    const isEmpty =
        !itemsLoading &&
        ((tab === "fandoms" && fandoms.length === 0) ||
            (tab === "categories" && categoriesList.length === 0) ||
            (tab === "subcategories" && subcategories.length === 0));

    return (
        <>
            <SetAdminChrome title="Каталог" titleRight={titleRight} />
            <Card>
                <Tabs>
                    <TabButton
                        type="button"
                        $active={tab === "fandoms"}
                        onClick={() => setTab("fandoms")}
                    >
                        Фандомы
                    </TabButton>
                    <TabButton
                        type="button"
                        $active={tab === "categories"}
                        onClick={() => setTab("categories")}
                    >
                        Категории
                    </TabButton>
                    <TabButton
                        type="button"
                        $active={tab === "subcategories"}
                        onClick={() => setTab("subcategories")}
                    >
                        Подкатегории
                    </TabButton>
                </Tabs>

                {tab === "subcategories" ? (
                    <FiltersRow>
                        <SearchInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Поиск по названию или адресу"
                        />
                        <Select
                            value={categoryFilter}
                            onChange={(event) => setCategoryFilter(event.target.value)}
                        >
                            <option value="">Все категории</option>
                            {categories.map((category) => (
                                <option key={category.slug} value={category.slug}>
                                    {category.title}
                                </option>
                            ))}
                        </Select>
                    </FiltersRow>
                ) : (
                    <SearchInput
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Поиск по названию или адресу"
                    />
                )}

                {itemsLoading ? <EmptyState>Загрузка…</EmptyState> : null}
                {isEmpty ? (
                    <EmptyState>
                        {trimmedSearch || categoryFilter
                            ? "Ничего не найдено."
                            : "Пока пусто."}
                    </EmptyState>
                ) : null}

                {tab === "fandoms" && fandoms.length > 0 ? (
                    <ItemList>
                        {fandoms.map((item) => (
                            <ItemRow key={item.slug}>
                                <ItemMain>
                                    <ItemTitle>{item.title}</ItemTitle>
                                    <ItemMeta>{item.slug}</ItemMeta>
                                </ItemMain>
                                <Badge $tone={item.isApproved ? "ok" : "warn"}>
                                    {item.isApproved ? "Одобрен" : "Не одобрен"}
                                </Badge>
                                <SideActions>
                                    <EditButton
                                        type="button"
                                        aria-label={`Редактировать: ${item.title}`}
                                        onClick={() => {
                                            setEditingFandom(item);
                                            setEditForm({
                                                ...emptyForm(),
                                                title: item.title,
                                                slug: item.slug,
                                                isApproved: item.isApproved === true,
                                            });
                                        }}
                                    >
                                        <Pencil size={14} />
                                    </EditButton>
                                    <DeleteButton
                                        type="button"
                                        aria-label={`Удалить: ${item.title}`}
                                        disabled={deleteMutation.isPending}
                                        onClick={() =>
                                            deleteMutation.mutate({
                                                kind: "fandoms",
                                                key: item.slug,
                                            })
                                        }
                                    >
                                        <Trash2 size={14} />
                                    </DeleteButton>
                                </SideActions>
                            </ItemRow>
                        ))}
                    </ItemList>
                ) : null}

                {tab === "categories" && categoriesList.length > 0 ? (
                    <ItemList>
                        {categoriesList.map((item) => (
                            <ItemRow key={item.slug}>
                                <ItemMain>
                                    <ItemTitle>{item.title}</ItemTitle>
                                    <ItemMeta>{item.slug}</ItemMeta>
                                </ItemMain>
                                <SideActions>
                                    <EditButton
                                        type="button"
                                        aria-label={`Редактировать: ${item.title}`}
                                        onClick={() => {
                                            setEditingCategory(item);
                                            setEditForm({
                                                ...emptyForm(),
                                                title: item.title,
                                                slug: item.slug,
                                            });
                                        }}
                                    >
                                        <Pencil size={14} />
                                    </EditButton>
                                    <DeleteButton
                                        type="button"
                                        aria-label={`Удалить: ${item.title}`}
                                        disabled={deleteMutation.isPending}
                                        onClick={() =>
                                            deleteMutation.mutate({
                                                kind: "categories",
                                                key: item.slug,
                                            })
                                        }
                                    >
                                        <Trash2 size={14} />
                                    </DeleteButton>
                                </SideActions>
                            </ItemRow>
                        ))}
                    </ItemList>
                ) : null}

                {tab === "subcategories" && subcategories.length > 0 ? (
                    <ItemList>
                        {subcategories.map((item) => (
                            <ItemRow key={item.id}>
                                <ItemMain>
                                    <ItemTitle>{item.title}</ItemTitle>
                                    <ItemMeta>
                                        {item.slug} ·{" "}
                                        {categoryTitleBySlug.get(item.categorySlug) ??
                                            item.categorySlug}
                                    </ItemMeta>
                                </ItemMain>
                                <Badge $tone={item.isApproved ? "ok" : "warn"}>
                                    {item.isApproved ? "Одобрен" : "Не одобрен"}
                                </Badge>
                                <SideActions>
                                    <EditButton
                                        type="button"
                                        aria-label={`Редактировать: ${item.title}`}
                                        onClick={() => {
                                            setEditingSubcategory(item);
                                            setEditForm({
                                                ...emptyForm(),
                                                title: item.title,
                                                slug: item.slug,
                                                categorySlug: item.categorySlug,
                                                isApproved: item.isApproved === true,
                                            });
                                        }}
                                    >
                                        <Pencil size={14} />
                                    </EditButton>
                                    <DeleteButton
                                        type="button"
                                        aria-label={`Удалить: ${item.title}`}
                                        disabled={deleteMutation.isPending}
                                        onClick={() =>
                                            deleteMutation.mutate({
                                                kind: "subcategories",
                                                key: item.id,
                                            })
                                        }
                                    >
                                        <Trash2 size={14} />
                                    </DeleteButton>
                                </SideActions>
                            </ItemRow>
                        ))}
                    </ItemList>
                ) : null}
            </Card>

            <TaxonomyFormModal
                isOpen={isCreateModalOpen}
                title={createModalTitle}
                form={createForm}
                isPending={createMutation.isPending}
                submitLabel="Добавить"
                mode={tab}
                isEdit={false}
                categories={categories}
                onClose={closeCreateModal}
                onSubmit={() => createMutation.mutate()}
                onChange={setCreateForm}
            />

            <TaxonomyFormModal
                isOpen={isEditOpen}
                title={editModalTitle}
                form={editForm}
                isPending={updateMutation.isPending}
                submitLabel="Сохранить"
                mode={tab}
                isEdit
                categories={categories}
                onClose={closeEditModal}
                onSubmit={() => updateMutation.mutate()}
                onChange={setEditForm}
            />
        </>
    );
}
