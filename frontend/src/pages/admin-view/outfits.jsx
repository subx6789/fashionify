import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Shirt, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ProductImageUpload from "@/components/admin-view/image-upload";

function AdminOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Image Upload State
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);

  const { toast } = useToast();

  const fetchOutfits = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + "/api/outfits");
      if (res.data.success) {
        setOutfits(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + "/api/admin/products/get");
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOutfits();
    fetchProducts();
  }, []);

  const toggleProduct = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(pid => pid !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleCreateOutfit = async (e) => {
    e.preventDefault();
    const finalImageUrl = (uploadedImageUrls && uploadedImageUrls.length > 0) ? uploadedImageUrls[0] : imageUrl;

    if (!name || !finalImageUrl || selectedProductIds.length === 0) {
      toast({ title: "Please fill name, provide an image (upload or URL), and select at least one product", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + "/api/outfits", {
        name,
        description,
        imageUrl: finalImageUrl,
        productIds: selectedProductIds
      });
      if (res.data.success) {
        toast({ title: "Outfit created successfully!" });
        setName("");
        setDescription("");
        setImageUrl("");
        setImageFiles([]);
        setUploadedImageUrls([]);
        setSelectedProductIds([]);
        fetchOutfits();
      }
    } catch (err) {
      toast({ title: "Error creating outfit", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOutfit = async (id) => {
    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/outfits/${id}`);
      if (res.data.success) {
        toast({ title: "Outfit deleted" });
        fetchOutfits();
      }
    } catch (err) {
      toast({ title: "Error deleting outfit", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Shirt className="w-8 h-8 text-primary" /> Manage Outfits (Shop the Look)
      </h1>
      
      <div className="bg-card p-6 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Create New Outfit Bundle</h2>
        <form onSubmit={handleCreateOutfit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Outfit Name</Label>
                <Input placeholder="e.g. Summer Vacation Vibes" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe this look..." value={description} onChange={e => setDescription(e.target.value)} rows={4} />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Cover Image</Label>
              <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
                <ProductImageUpload
                  imageFiles={imageFiles}
                  setImageFiles={setImageFiles}
                  uploadedImageUrls={uploadedImageUrls}
                  setUploadedImageUrls={setUploadedImageUrls}
                  setImageLoadingState={setImageLoadingState}
                  imageLoadingState={imageLoadingState}
                  isEditMode={false}
                  uploadUrl="/api/outfits/upload-image"
                />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">OR ENTER URL</span>
                  </div>
                </div>
                <Input 
                  placeholder="https://..." 
                  value={imageUrl} 
                  onChange={e => {
                    setImageUrl(e.target.value);
                    if (e.target.value) {
                      setUploadedImageUrls([]);
                      setImageFiles([]);
                    }
                  }} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label>Select Products for this Look ({selectedProductIds.length} selected)</Label>
            <div className="border rounded-xl p-4 max-h-[300px] overflow-y-auto bg-muted/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {products.map(product => {
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <div 
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={`relative flex items-center gap-3 p-2 rounded-lg cursor-pointer border-2 transition-all ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 bg-background'}`}
                    >
                      <img src={product.image || product.images?.[0]} alt={product.title} className="w-12 h-12 object-cover rounded-md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground">₹{product.price}</p>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-primary absolute top-2 right-2" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full font-bold h-12 text-lg">
            <Plus className="w-5 h-5 mr-2" /> Save Outfit
          </Button>
        </form>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Existing Outfits</h2>
          {outfits.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No outfits created yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {outfits.map(outfit => (
                <div key={outfit.id} className="border rounded-xl overflow-hidden bg-background">
                  <div className="h-48 w-full overflow-hidden relative">
                    <img src={outfit.imageUrl} alt={outfit.name} className="w-full h-full object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 rounded-full shadow-lg"
                      onClick={() => handleDeleteOutfit(outfit.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-lg">{outfit.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{outfit.description}</p>
                    <div className="flex gap-2 items-center flex-wrap pt-2">
                      {outfit.products?.map(p => (
                        <div key={p.id} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden -ml-2 first:ml-0" title={p.title}>
                          <img src={p.imageUrl || p.images?.[0] || p.image} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <span className="text-xs font-semibold text-muted-foreground ml-2">{outfit.products?.length} items</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOutfits;
