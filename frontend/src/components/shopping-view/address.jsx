/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: address.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 5
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { useEffect, useState } from "react";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { addressFormControls } from "@/config";
import useShopAddressStore from "@/store/useShopAddressStore";
import useAuthStore from "@/store/useAuthStore";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";

const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const user = useAuthStore((state) => state.user);
  const addressList = useShopAddressStore((state) => state.addressList);
  const fetchAllAddresses = useShopAddressStore((state) => state.fetchAllAddresses);
  const addNewAddress = useShopAddressStore((state) => state.addNewAddress);
  const editaAddress = useShopAddressStore((state) => state.editaAddress);
  const deleteAddress = useShopAddressStore((state) => state.deleteAddress);
  const { toast } = useToast();

  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast({
        title: "You can add max 3 addresses",
        variant: "destructive",
      });

      return;
    }

    currentEditedId !== null
      ? editaAddress({
          userId: user?.id,
          addressId: currentEditedId,
          formData,
        }).then((data) => {
          if (data?.payload?.success) {
            fetchAllAddresses(user?.id);
            setCurrentEditedId(null);
            setFormData(initialAddressFormData);
            toast({
              title: "Address updated successfully",
            });
          }
        })
      : addNewAddress({
          ...formData,
          userId: user?.id,
        }).then((data) => {
          if (data?.payload?.success) {
            fetchAllAddresses(user?.id);
            setFormData(initialAddressFormData);
            toast({
              title: "Address added successfully",
            });
          }
        });
  }

  function handleDeleteAddress(getCurrentAddress) {
    deleteAddress({ userId: user?.id, addressId: getCurrentAddress?._id }).then((data) => {
      if (data?.payload?.success) {
        fetchAllAddresses(user?.id);
        toast({
          title: "Address deleted successfully",
        });
      }
    });
  }

  function handleEditAddress(getCuurentAddress) {
    setCurrentEditedId(getCuurentAddress?.id);
    setFormData({
      ...formData,
      address: getCuurentAddress?.address,
      city: getCuurentAddress?.city,
      phone: getCuurentAddress?.phone,
      pincode: getCuurentAddress?.pincode,
      notes: getCuurentAddress?.notes,
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key].trim() !== "")
      .every((item) => item);
  }

  useEffect(() => {
    fetchAllAddresses(user?.id);
  }, [fetchAllAddresses, user?.id]);



  return (
    <Card>
      <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2  gap-2">
            {addressList && addressList.length > 0
              ? addressList.map((singleAddressItem) => (
                  <AddressCard
                    key={singleAddressItem?.id}
                    selectedId={selectedId}
                    handleDeleteAddress={handleDeleteAddress}
                    addressInfo={singleAddressItem}
                    handleEditAddress={handleEditAddress}
                    setCurrentSelectedAddress={setCurrentSelectedAddress}
                  />
                ))
              : null}
      </div>
      {addressList && addressList.length >= 3 && currentEditedId === null ? null : (
        <>
          <CardHeader>
            <CardTitle>
              {currentEditedId !== null ? "Edit Address" : "Add New Address"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CommonForm
              formControls={addressFormControls}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              onSubmit={handleManageAddress}
              isBtnDisabled={!isFormValid()}
            />
          </CardContent>
        </>
      )}
    </Card>
  );
}

export default Address;
