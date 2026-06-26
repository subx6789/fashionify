/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: image-upload.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 9
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { FileIcon, UploadCloudIcon, XIcon, PlusIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { uploadImage } from "@/services/api";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "../ui/use-toast";

function ProductImageUpload({
  imageFiles,
  setImageFiles,
  imageLoadingState,
  uploadedImageUrls,
  setUploadedImageUrls,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false,
  uploadUrl = "/api/admin/products/upload-image",
  multiple = true,
  title = "Upload Image",
  helpText,
  dropText = "Drag & drop or click to upload",
  subDropText,
  imageClass = "w-24 h-24 object-cover",
}) {
  const inputRef = useRef(null);
  const { toast } = useToast();

  const [uploadProgress, setUploadProgress] = useState(0);

  async function uploadImageToCloudinary(file) {
    try {
      const data = new FormData();
      data.append("my_file", file);
      const response = await uploadImage(uploadUrl, data, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      if (response?.data?.success) {
        return response.data.result.url;
      }
    } catch (error) {
      console.error("Failed to upload image to Cloudinary", error);
      toast({
        title: "Image upload failed",
        variant: "destructive",
      });
    }
    return null;
  }

  async function handleImageFilesChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    // Validation
    const validFiles = [];
    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Image must be under 5MB", variant: "destructive" });
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      if (!file.type.match(/image\/(jpeg|png|avif)/)) {
        toast({ title: "Only JPG, PNG, and AVIF formats are allowed", variant: "destructive" });
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      validFiles.push(file);
    }

    setUploadProgress(0);
    setImageLoadingState(true);
    const newFiles = [...(imageFiles || []), ...validFiles];
    setImageFiles(newFiles);

    const urls = await Promise.all(validFiles.map(uploadImageToCloudinary));
    const validUrls = urls.filter(Boolean);
    setUploadedImageUrls((prev) => [...(prev || []), ...validUrls]);
    setImageLoadingState(false);
    setUploadProgress(0);

    // Clear input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    if (droppedFiles.length) {
      // Trigger same logic
      const fakeEvent = { target: { files: droppedFiles } };
      handleImageFilesChange(fakeEvent);
    }
  }

  function handleRemoveImage(index) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  const currentUrls = uploadedImageUrls || [];
  const currentFiles = imageFiles || [];

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : ""}`}>
      <Label className="text-lg font-semibold mb-3 block">
        {title}
        {helpText && (
          <span className="text-sm font-normal text-muted-foreground ml-2">
            {helpText}
          </span>
        )}
      </Label>

      {/* Uploaded image thumbnails */}
      {currentUrls.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {currentUrls.map((url, index) => (
            <div
              key={index}
              className={`relative group rounded-xl overflow-hidden border-2 ${
                index === 0
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border"
              }`}
            >
              <img
                src={url}
                alt={`Uploaded image ${index + 1}`}
                className={imageClass}
              />
              {index === 0 && multiple && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold text-center py-0.5">
                  COVER
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add more button */}
          {!isEditMode && multiple && (
            <label
              htmlFor="image-upload-more"
              className="w-24 h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-border hover:bg-primary/5 transition-all"
            >
              <PlusIcon className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">Add more</span>
              <Input
                id="image-upload-more"
                type="file"
                accept="image/png, image/jpeg, image/avif"
                multiple
                className="hidden"
                ref={inputRef}
                onChange={handleImageFilesChange}
                disabled={isEditMode}
              />
            </label>
          )}
        </div>
      )}

      {/* Initial drop zone when no images */}
      {currentUrls.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`${
            isEditMode ? "opacity-60" : ""
          } border-2 border-dashed rounded-xl p-6 transition-colors hover:border-primary-border hover:bg-primary/5`}
        >
          <Input
            id="image-upload"
            type="file"
            accept="image/png, image/jpeg, image/avif"
            multiple={multiple}
            className="hidden"
            ref={inputRef}
            onChange={handleImageFilesChange}
            disabled={isEditMode}
          />
          {imageLoadingState ? (
            <div className="space-y-2">
              <Skeleton className="h-10 bg-gray-100" />
              <Skeleton className="h-4 bg-gray-100 w-1/2 mx-auto" />
            </div>
          ) : (
            <Label
              htmlFor="image-upload"
              className={`${
                isEditMode ? "cursor-not-allowed" : "cursor-pointer"
              } flex flex-col items-center justify-center gap-2`}
            >
              <UploadCloudIcon className="w-12 h-12 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground text-center">
                {dropText}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                {subDropText}
              </span>
            </Label>
          )}
        </div>
      )}

      {imageLoadingState && (
        <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="flex items-center gap-2 text-foreground">
              <UploadCloudIcon className="w-4 h-4 animate-bounce text-primary" />
              Uploading...
            </span>
            <span className="text-muted-foreground font-bold">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductImageUpload;
