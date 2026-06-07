import { useState, useEffect } from "react";
import { getCollections, getAdminProducts, createCollection, deleteCollection } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Shirt, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ProductImageUpload from "@/components/admin-view/image-upload";

function AdminCollections() {
  const [collections, setCollections] = useState([]);
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

  const fetchCollections = async () => {
    try {
      const res = await getCollections();
      if (res.data.success) {
        setCollections(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getAdminProducts();
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

  const toggleProduct = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(pid => pid !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    const finalImageUrl = (uploadedImageUrls && uploadedImageUrls.length > 0) ? uploadedImageUrls[0] : imageUrl;

    if (!name || !finalImageUrl || selectedProductIds.length === 0) {
      toast({ title: "Please fill name, provide an image (upload or URL), and select at least one product", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const res = await createCollection({
        name,
        description,
        imageUrl: finalImageUrl,
        productIds: selectedProductIds
      });
      if (res.data.success) {
        toast({ title: "Collection created successfully!" });
        setName("");
        setDescription("");
        setImageUrl("");
        setImageFiles([]);
        setUploadedImageUrls([]);
        setSelectedProductIds([]);
        fetchCollections();
      }
    } catch (err) {
      toast({ title: "Error creating collection", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (id) => {
    try {
      const res = await deleteCollection(id);
      if (res.data.success) {
        toast({ title: "Collection deleted" });
        fetchCollections();
      }
    } catch (err) {
      toast({ title: "Error deleting collection", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Shirt className="w-8 h-8 text-primary" /> Manage Collections
      </h1>
      
      <div className="bg-card p-6 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Create New Collection Bundle</h2>
        <form onSubmit={handleCreateCollection} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Collection Name</Label>
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
                  uploadUrl="/api/collections/upload-image"
                  multiple={false}
                  title="Collection Cover Image"
                  helpText="(Cover display. Optimal: 1200x1500px, 4:5)"
                  dropText="Drag & drop or click to upload cover image"
                  subDropText="Upload 1 image only"
                  imageClass="w-32 h-40 object-cover rounded-md"
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
            <Label>Select Products for this Collection ({selectedProductIds.length} selected)</Label>
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
            <Plus className="w-5 h-5 mr-2" /> Save Collection
          </Button>
        </form>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Existing Collections</h2>
          {collections.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No collections created yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collections.map(collection => (
                <div key={collection.id} className="border rounded-xl overflow-hidden bg-background">
                  <div className="h-48 w-full overflow-hidden relative">
                    <img src={collection.imageUrl} alt={collection.name} className="w-full h-full object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 rounded-full shadow-lg"
                      onClick={() => handleDeleteCollection(collection.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-lg">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
                    <div className="flex gap-2 items-center flex-wrap pt-2">
                      {collection.products?.map(p => (
                        <div key={p.id} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden -ml-2 first:ml-0" title={p.title}>
                          <img src={p.imageUrl || p.images?.[0] || p.image} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <span className="text-xs font-semibold text-muted-foreground ml-2">{collection.products?.length} items</span>
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

export default AdminCollections;
