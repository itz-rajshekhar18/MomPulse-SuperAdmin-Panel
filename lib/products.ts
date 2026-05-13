import { db, storage } from './firebase';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  where,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string | null;
  stock?: number;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string | null;
  stock?: number;
}

// Get all products
export async function getProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Product));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Get active products only
export async function getActiveProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Product));
  } catch (error) {
    console.error('Error fetching active products:', error);
    return [];
  }
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('category', '==', category));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Product));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

// Create a new product
export async function createProduct(productData: CreateProductInput): Promise<string | null> {
  try {
    const productsRef = collection(db, 'products');
    
    const newProduct = {
      ...productData,
      status: 'active',
      stock: productData.stock || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('Creating product with data:', newProduct);
    const docRef = await addDoc(productsRef, newProduct);
    console.log('Product created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating product:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error; // Re-throw to let the component handle it
  }
}

// Update a product
export async function updateProduct(productId: string, updates: Partial<CreateProductInput>): Promise<boolean> {
  try {
    const productRef = doc(db, 'products', productId);
    
    await updateDoc(productRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
}

// Delete a product
export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

// Toggle product status
export async function toggleProductStatus(productId: string, currentStatus: 'active' | 'inactive'): Promise<boolean> {
  try {
    const productRef = doc(db, 'products', productId);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    await updateDoc(productRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error toggling product status:', error);
    return false;
  }
}

// Update product stock
export async function updateProductStock(productId: string, stock: number): Promise<boolean> {
  try {
    const productRef = doc(db, 'products', productId);
    
    await updateDoc(productRef, {
      stock,
      updatedAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error updating product stock:', error);
    return false;
  }
}

// Upload product image
export async function uploadProductImage(file: File, productId: string): Promise<string | null> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('File must be an image');
      return null;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File size must be less than 5MB');
      return null;
    }

    // Create storage reference
    const fileName = `${productId}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `products/${fileName}`);

    console.log('Uploading image to:', `products/${fileName}`);
    
    // Upload file with timeout
    const uploadTask = uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading product image:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    // Return null instead of throwing - image is optional
    return null;
  }
}

// Delete product image
export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/o/')[1].split('?')[0];
    const decodedPath = decodeURIComponent(urlParts);
    
    const storageRef = ref(storage, decodedPath);
    await deleteObject(storageRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting product image:', error);
    return false;
  }
}
