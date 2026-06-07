import { useState, useEffect } from "react";
import { getCoupons, createCoupon, deleteCoupon } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Tag, RefreshCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE",
    value: "",
    minimumOrderAmount: "",
    startDate: "",
    expiryDate: "",
    maxRedemptions: "",
    perUserLimit: ""
  });

  const fetchCoupons = async () => {
    try {
      const res = await getCoupons();
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.value || !formData.type) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        value: Number(formData.value),
        minimumOrderAmount: formData.minimumOrderAmount ? Number(formData.minimumOrderAmount) : null,
        maxRedemptions: formData.maxRedemptions ? Number(formData.maxRedemptions) : null,
        perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
      };

      const res = await createCoupon(payload);
      if (res.data.success) {
        toast({ title: "Coupon created successfully!" });
        setFormData({
          code: "",
          description: "",
          type: "PERCENTAGE",
          value: "",
          minimumOrderAmount: "",
          startDate: "",
          expiryDate: "",
          maxRedemptions: "",
          perUserLimit: ""
        });
        fetchCoupons();
      }
    } catch (err) {
      toast({ title: "Error creating coupon", variant: "destructive", description: err.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      const res = await deleteCoupon(id);
      if (res.data.success) {
        toast({ title: "Coupon deleted" });
        fetchCoupons();
      }
    } catch (err) {
      toast({ title: "Error deleting coupon", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-display font-black flex items-center gap-3">
          <div className="p-2 bg-primary border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Tag className="w-8 h-8 text-primary-foreground" />
          </div>
          Promo Codes
        </h1>
        <Button onClick={fetchCoupons} variant="outline" className="neu-btn-outline font-bold">
          <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>
      
      <div className="neu-card p-6 bg-card">
        <h2 className="text-2xl font-black mb-6 border-b-2 border-border pb-2">Create New Coupon</h2>
        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="font-bold">Coupon Code *</Label>
            <Input 
              name="code"
              className="neu-input"
              placeholder="e.g. SUMMER25" 
              value={formData.code} 
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Discount Type *</Label>
            <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
              <SelectTrigger className="neu-input w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Value * {formData.type === "FREE_SHIPPING" && "(Enter 0)"}</Label>
            <Input 
              name="value"
              type="number"
              className="neu-input"
              placeholder={formData.type === "PERCENTAGE" ? "e.g. 25" : "e.g. 500"} 
              value={formData.value} 
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2 lg:col-span-3">
            <Label className="font-bold">Description</Label>
            <Input 
              name="description"
              className="neu-input"
              placeholder="e.g. 25% off all summer items" 
              value={formData.description} 
              onChange={handleChange} 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Min. Order Amount (₹)</Label>
            <Input 
              name="minimumOrderAmount"
              type="number"
              className="neu-input"
              placeholder="e.g. 1500" 
              value={formData.minimumOrderAmount} 
              onChange={handleChange} 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Max Redemptions (Total)</Label>
            <Input 
              name="maxRedemptions"
              type="number"
              className="neu-input"
              placeholder="e.g. 1000" 
              value={formData.maxRedemptions} 
              onChange={handleChange} 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Per User Limit</Label>
            <Input 
              name="perUserLimit"
              type="number"
              className="neu-input"
              placeholder="e.g. 1" 
              value={formData.perUserLimit} 
              onChange={handleChange} 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Start Date</Label>
            <Input 
              name="startDate"
              type="datetime-local"
              className="neu-input"
              value={formData.startDate} 
              onChange={handleChange} 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Expiry Date</Label>
            <Input 
              name="expiryDate"
              type="datetime-local"
              className="neu-input"
              value={formData.expiryDate} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="lg:col-span-3 flex justify-end mt-4">
            <Button type="submit" disabled={loading} className="neu-btn-primary w-full md:w-auto h-12 text-lg">
              <Plus className="w-5 h-5 mr-2" /> {loading ? "Creating..." : "Create Coupon"}
            </Button>
          </div>
        </form>
      </div>

      <div className="neu-card p-6 bg-card">
        <h2 className="text-2xl font-black mb-6 border-b-2 border-border pb-2">Active Coupons</h2>
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Tag className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-bold text-xl">No active coupons</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coupons.map(coupon => (
              <div key={coupon.id} className="relative border-2 border-black rounded-lg p-5 bg-[hsl(var(--neu-yellow)/0.1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="absolute -top-3 -right-3">
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(coupon.id)} className="rounded-full bg-red-500 hover:bg-red-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mb-2">
                  <span className="inline-block bg-black text-[hsl(var(--neu-yellow))] font-black px-3 py-1 text-sm rounded-sm">
                    {coupon.code}
                  </span>
                </div>
                <h3 className="font-black text-2xl text-primary mb-1">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : coupon.type === "FIXED" ? `₹${coupon.value} OFF` : "FREE SHIPPING"}
                </h3>
                {coupon.description && <p className="text-sm font-bold text-muted-foreground mb-3">{coupon.description}</p>}
                
                <div className="grid grid-cols-2 gap-2 text-xs font-medium border-t-2 border-black pt-3 mt-2">
                  <div>
                    <span className="opacity-70">Used:</span> <span className="font-bold">{coupon.totalRedemptions}</span>
                  </div>
                  <div>
                    <span className="opacity-70">Min Order:</span> <span className="font-bold">{coupon.minimumOrderAmount ? `₹${coupon.minimumOrderAmount}` : "None"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="opacity-70">Expires:</span> <span className="font-bold">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "Never"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCoupons;
