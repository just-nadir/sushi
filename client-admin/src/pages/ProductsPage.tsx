import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Upload, Trash2, Pencil, Filter, X } from "lucide-react";
import { api, Product, Category, uploadFile } from "@/lib/api";
import { toast } from "sonner";

export function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [prodRes, catRes] = await Promise.all([
                api.get("/products"),
                api.get("/categories")
            ]);

            const pData = prodRes.data.data || prodRes.data || [];
            const cData = catRes.data.data || catRes.data || [];

            setProducts(Array.isArray(pData) ? pData : []);
            setCategories(Array.isArray(cData) ? cData : []);
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Ma'lumotlarni yuklashda xatolik");
        } finally {
            setIsLoading(false);
        }
    };

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
        try {
            const payload = {
                ...formData,
                price: Number(formData.price)
            };

            if (editingId) {
                await api.patch(`/products/${editingId}`, payload);
                toast.success("Mahsulot yangilandi");
            } else {
                await api.post("/products", payload);
                toast.success("Mahsulot qo'shildi");
            }

            closeModal();
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("Saqlashda xatolik yuz berdi");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) return;

        try {
            await api.delete(`/products/${id}`);
            toast.success("Mahsulot o'chirildi");
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("O'chirishda xatolik");
        }
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

    // Filtering Logic
    const filteredProducts = products.filter(product => {
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
                    <p className="text-muted-foreground">Menyu taomlari va ichimliklarni boshqarish</p>
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

            {/* Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 border-b sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500 w-20">Rasm</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">Nomi</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">Kategoriya</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">Narxi</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                // Setup skeleton or loading text here
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-muted-foreground">Yuklanmoqda...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Search className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <p className="font-medium text-gray-900">Mahsulotlar topilmadi</p>
                                            <p className="text-sm text-gray-500">Qidiruv so'zini o'zgartirib ko'ring yoki yangi mahsulot qo'shing.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const categoryName = categories.find(c => c.id === product.categoryId)?.name || "Noma'lum";
                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-3">
                                                <div className="h-12 w-12 rounded-lg bg-gray-100 border overflow-hidden">
                                                    <img
                                                        src={product.image || "https://placehold.co/100"}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{product.description}</p>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                    {categoryName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 font-medium text-gray-900">
                                                {product.price.toLocaleString()} so'm
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (Simple footer count) */}
                <div className="border-t p-4 text-xs text-gray-500 flex justify-between">
                    <span>Jami: {filteredProducts.length} mahsulot</span>
                    <span>Ko'rsatilmoqda: {filteredProducts.length}</span>
                </div>
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
