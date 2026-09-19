'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { productService } from '@/src/app/components/modules/products/core/services/productService';
import { Product } from '@/src/app/components/modules/products/core/models/productModel';
import ProductDetails from '@/src/app/components/modules/products/components/ProductDetails';
import { useAlert } from "@/src/app/components/context/AlertContext";

const ProductDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useAlert();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params?.id) return;

        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const res = await productService.getProductById(Number(params.id));
                const response = res as any;

                const singleProduct = response?.data?.product || response?.product || response?.data || response;

                if (singleProduct && (singleProduct.id || singleProduct.productName)) {
                    setProduct(singleProduct);
                } else {
                    showToast("Could not read detailed data structure for this product.", "error");
                    router.push('/admin/products');
                }
            } catch (err) {
                console.error("Error fetching product details:", err);
                showToast("Failed to fetch product details.", "error");
                router.push('/admin/products');
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [params?.id, router, showToast]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
                <div className="text-center space-y-2">
                    <Loader2 className="animate-spin text-emerald-500 mx-auto" size={40} />
                    <p className="text-sm text-gray-500 font-medium">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <ProductDetails
            product={product}
            onBack={() => router.push('/admin/products')}
        />
    );
};

export default ProductDetailPage;