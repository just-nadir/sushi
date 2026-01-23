import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Upload, Trash2, Pencil, Filter, X, GripVertical, Eye, EyeOff } from "lucide-react";
import { Product, Category, uploadFile, api } from "@/lib/api";
import { toast } from "sonner";
import {
    useProductsControllerFindAll,
    useProductsControllerCreate,
    useProductsControllerUpdate,
    useProductsControllerRemove,
    useCategoriesControllerFindAll
} from "@/lib/api/generated";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Reorder, useDragControls } from "framer-motion";

export function ProductsPage() {
    const queryClient = useQueryClient();

    // Data Fetching
    const { data: productsRaw, isLoading: pLoading } = useProductsControllerFindAll();
    const { data: categoriesRaw, isLoading: cLoading } = useCategoriesControllerFindAll();

    const products = (((productsRaw?.data as any)?.data || []) as unknown) as Product[];
    const categories = (((categoriesRaw?.data as any)?.data || []) as unknown) as Category[];
    const isLoading = pLoading || cLoading;

    // Local State for DnD
    const [localProducts, setLocalProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (products.length > 0) {
            setLocalProducts(products);
        }
    }, [products]);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        image: ""
    });

    // Reorder Mutation
    const reorderMutation = useMutation({
        mutationFn: async (newOrder: Product[]) => {
            // Optimistic update - in real app, might want to send only changed IDs
            // Sending index as sortOrder
            const updates = newOrder.map((prod, index) =>
                api.patch(`/products/${prod.id}`, { sortOrder: index })
            );
            await Promise.all(updates);
        },
        onSuccess: () => {
            // Invalidate silently or just toast
            // queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        },
        onError: () => {
            toast.error("Tartibni saqlashda xatolik");
        }
    });

    // CRUD Mutations
    const createMutation = useProductsControllerCreate({
        mutation: {
            onSuccess: () => {
                toast.success("Mahsulot qo'shildi");
                queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                closeModal();
            },
            onError: () => toast.error("Saqlashda xatolik yuz berdi")
        }
    });

    const updateMutation = useProductsControllerUpdate({
        mutation: {
            onSuccess: () => {
                toast.success("Mahsulot yangilandi");
                queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                closeModal();
            },
            onError: () => toast.error("Saqlashda xatolik yuz berdi")
        }
    });

    const deleteMutation = useProductsControllerRemove({
        mutation: {
            onSuccess: () => {
                toast.success("Mahsulot o'chirildi");
                queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            },
            onError: () => toast.error("O'chirishda xatolik")
        }
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const url = await uploadFile(file);
            setFormData(prev => ({ ...prev, image: url }));
            toast.success("Rasm yuklandi");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Rasm yuklashda xatolik!");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: Number(formData.price)
        };

        if (editingId) {
            updateMutation.mutate({ id: editingId, data: payload });
        } else {
            // For new product, backend should handle sortOrder (add to end) logic if implemented,
            // or it defaults to 0 and we might need to resort.
            // For now rely on backend default or basic logic.
            createMutation.mutate({ data: payload });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) return;
        deleteMutation.mutate({ id });
    };

    const openEditModal = (product: Product) => {
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            categoryId: product.categoryId,
            image: product.image || ""
        });
        setEditingId(product.id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: "", description: "", price: "", categoryId: "", image: "" });
    };

    const handleReorder = (newOrder: Product[]) => {
        setLocalProducts(newOrder);
    };

    const handleDragEnd = () => {
        // Only save if filter is NOT active (to avoid messing up global order with partial list)
        if (searchQuery === "" && selectedCategory === "all") {
            reorderMutation.mutate(localProducts);
            toast.success("Tartib saqlandi");
        }
    };

    // Filtering Logic
    // We shouldn't filter `products` (backend data), but `localProducts` (UI state)
    // BUT `Reorder` needs the full list to govern order.
    // Complexity: If we filter, we can't really reorder the hidden items relative to shown ones easily.
    // Solution: Disable Reorder when filtered.
    const isFiltered = searchQuery !== "" || selectedCategory !== "all";

    const filteredProducts = localProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-8 h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mahsulotlar</h1>
                    <p className="text-muted-foreground">Tortib surish (Drag & Drop) orqali tartiblang</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary/25">
                    <Plus className="mr-2 h-4 w-4" /> Yangi Mahsulot
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Qidiruv..."
                        className="pl-9 pr-4 py-2 w-full text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 border-l pl-4">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                        className="text-sm outline-none bg-transparent font-medium text-gray-700"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">Barcha Kategoriyalar</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List Header (Fake Table Header) */}
            <div className="bg-gray-50/80 rounded-lg border border-gray-100 px-6 py-3 grid grid-cols-[40px_60px_2fr_1fr_1fr_100px] gap-4 text-sm font-semibold text-gray-500">
                <div className="text-center">#</div>
                <div>Rasm</div>
                <div>Nomi</div>
                <div>Kategoriya</div>
                <div>Narxi</div>
                <div className="text-right">Amallar</div>
            </div>

            {/* List / Reorder Group */}
            <div className="flex-1 bg-white rounded-xl border shadow-sm p-2 overflow-y-auto">
                {isLoading ? (
                    <div className="text-center py-20 text-muted-foreground">Yuklanmoqda...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">Mahsulotlar topilmadi</div>
                ) : (
                    <Reorder.Group
                        as="div"
                        axis="y"
                        values={filteredProducts} // Note: This might be weird if filtered. Reorder expects full list usually?
                        // Actually Reorder works on the list passed. But if we pass a filtered list, we are reordering "indices of the filtered list".
                        // Logic: If filtered, do NOT update `localProducts` via `onReorder`, or it deletes hidden items!
                        // FIX: Only allow reorder when NOT filtered.
                        onReorder={!isFiltered ? handleReorder : () => { }}
                        className="flex flex-col gap-2"
                    >
                        {filteredProducts.map((product) => {
                            const categoryName = categories.find(c => c.id === product.categoryId)?.name || "Noma'lum";
                            return (
                                <ProductItem
                                    key={product.id}
                                    product={product}
                                    categoryName={categoryName}
                                    isDragDisabled={isFiltered}
                                    onDragEnd={handleDragEnd}
                                    onEdit={() => openEditModal(product)}
                                    onDelete={() => handleDelete(product.id)}
                                    onToggle={async () => {
                                        await updateMutation.mutateAsync({
                                            id: product.id,
                                            data: { isAvailable: !product.isAvailable }
                                        });
                                    }}
                                />
                            );
                        })}
                    </Reorder.Group>
                )}
            </div>

            {/* Pagination (Simple footer count) */}
            <div className="bg-white border-t rounded-b-xl p-4 text-xs text-gray-500 flex justify-between">
                <span>Jami: {filteredProducts.length} mahsulot</span>
                {isFiltered && <span className="text-orange-600 font-medium">Filtrlangan holatda tartiblash o'chirilgan</span>}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingId ? "Mahsulotni Tahrirlash" : "Yangi Mahsulot"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            {/* Image Upload Area */}
                            <div className="flex gap-4">
                                <div className="h-24 w-24 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                                    {formData.image ? (
                                        <>
                                            <img src={formData.image} className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Pencil className="text-white h-6 w-6" />
                                            </div>
                                        </>
                                    ) : (
                                        <Upload className="h-8 w-8 text-gray-400" />
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Mahsulot Rasmi</label>
                                    <p className="text-xs text-muted-foreground">
                                        JPG, PNG formatida. Maksimal 5MB. <br />
                                        Rasm yuklash majburiy emas, lekin tavsiya etiladi.
                                    </p>
                                    {isUploading && <span className="text-xs text-blue-600 font-medium animate-pulse">Yuklanmoqda...</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Nomi</label>
                                    <input
                                        required
                                        placeholder="Masalan: Filadelfiya Roll"
                                        className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>

                                <div className="col-span-1">
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Kategoriya</label>
                                    <select
                                        required
                                        className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-white transition-all"
                                        value={formData.categoryId}
                                        onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                    >
                                        <option value="">Tanlang...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-1">
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Narxi (so'm)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0"
                                        className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={formData.price}
                                        onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Izoh (Tarkibi)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Guruch, losos, sir..."
                                        className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t mt-2">
                                <Button type="button" variant="ghost" onClick={closeModal} className="hover:bg-gray-100">Bekor qilish</Button>
                                <Button type="submit" disabled={isUploading} className="min-w-[120px]">
                                    {isUploading ? "Yuklanmoqda..." : (editingId ? "Saqlash" : "Qo'shish")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProductItem({
    product, categoryName, isDragDisabled, onDragEnd, onEdit, onDelete, onToggle
}: {
    product: Product, categoryName: string, isDragDisabled: boolean, onDragEnd: () => void, onEdit: () => void, onDelete: () => void, onToggle: () => Promise<void>
}) {
    const controls = useDragControls();


    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            await onToggle();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Reorder.Item
            value={product}
            dragListener={!isDragDisabled}
            dragControls={controls}
            onDragEnd={onDragEnd}
            className={`
                grid grid-cols-[40px_60px_2fr_1fr_1fr_100px] gap-4 items-center px-4 py-3 bg-white border rounded-lg select-none transition-shadow
                ${isDragDisabled ? 'opacity-80' : 'hover:border-primary/50 hover:shadow-md'}
                ${!product.isAvailable ? 'opacity-60 bg-gray-50' : ''}
            `}
            whileDrag={{ zIndex: 999, boxShadow: "0px 10px 30px rgba(0,0,0,0.15)", scale: 1.02 }}
        >
            <div
                className={`flex justify-center p-2 rounded-md ${isDragDisabled ? 'cursor-not-allowed opacity-30' : 'cursor-grab active:cursor-grabbing hover:bg-gray-50 text-gray-400'}`}
                onPointerDown={(e) => !isDragDisabled && controls.start(e)}
            >
                <GripVertical className="h-5 w-5" />
            </div>

            <div className="h-10 w-10 rounded-lg bg-gray-100 border overflow-hidden relative">
                <img
                    src={product.image || "https://placehold.co/100"}
                    alt={product.name}
                    className={`h-full w-full object-cover ${!product.isAvailable ? 'grayscale' : ''}`}
                />
            </div>

            <div>
                <p className="font-medium text-gray-900 line-clamp-1 flex items-center gap-2">
                    {product.name}
                    {!product.isAvailable && (
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded border">Faol emas</span>
                    )}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
            </div>

            <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {categoryName}
                </span>
            </div>

            <div className="font-medium text-gray-900">
                {product.price.toLocaleString()}
            </div>

            <div className="flex justify-end gap-2">
                <button
                    onClick={handleToggle}
                    disabled={isLoading}
                    title={product.isAvailable ? "Faolsizlantirish" : "Faollashtirish"}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${product.isAvailable
                        ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                >
                    {isLoading ? (
                        <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    ) : (
                        product.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />
                    )}
                </button>
                <button
                    onClick={onEdit}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    onClick={onDelete}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

        </Reorder.Item>
    );
}
