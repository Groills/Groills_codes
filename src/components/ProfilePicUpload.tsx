import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiCheck, FiRotateCw } from 'react-icons/fi';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function ProfilePictureUpload() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const onSelectFile = useCallback((file: File) => {
    if (file) {
      setImgSrc(URL.createObjectURL(file));
      setIsEditing(true);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      onSelectFile(acceptedFiles[0]);
    },
  });

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  function handleSave() {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;
    
    const canvas = previewCanvasRef.current;
    const image = imgRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    // Convert canvas to blob and save
    canvas.toBlob((blob) => {
      if (!blob) return;
      // Save to your form state here
      setIsEditing(false);
      // Set your form value with the cropped image
      // form.setValue("profilePic", file);
    }, 'image/png');
  }

  return (
    <div>
      <label className="block text-sm font-medium text-white mb-1">
        Profile Picture
      </label>

      {!imgSrc ? (
        <div
          {...getRootProps()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all hover:border-blue-400"
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <div className="mx-auto h-24 w-24 rounded-full flex items-center justify-center">
              <FiUpload className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">
              Drag and drop your profile picture here, or click to select
            </p>
            <p className="text-xs text-gray-600">
              JPEG, JPG, PNG up to 5MB
            </p>
          </div>
        </div>
      ) : isEditing ? (
        <div className="space-y-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <img
              ref={imgRef}
              src={imgSrc}
              onLoad={onImageLoad}
              className="max-h-64 rounded-md"
            />
          </ReactCrop>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <FiX className="mr-2" /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <FiCheck className="mr-2" /> Save
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex justify-center">
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src={imgSrc}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
          >
            <FiRotateCw size={16} />
          </button>
        </div>
      )}

      {/* Hidden canvas for cropping */}
      <canvas
        ref={previewCanvasRef}
        className="hidden"
      />
    </div>
  );
}