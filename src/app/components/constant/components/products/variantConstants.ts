// @/src/app/components/modules/products/core/constants/variantConstants.ts

export const SIZE_OPTIONS = [
    'One Size', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL',
    '14', '16', '18', '20', '24',
    '26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46',
];

export const COLOR_OPTIONS = [
    'White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink','Slate Gray','Slate Blue','Muted Lavender','Blue Stripe','Chocolate','Navy Blue', 'Gray', 'Brown', 'Navy',
    'Rust', 'Peach', 'Gold', 'Silver', 'Bronze', 'Copper', 'Teal', 'Cyan', 'Magenta', 'Olive', 'Khaki',
    'Mustard', 'Terracotta', 'Lavender', 'Turquoise', 'Sky Blue', 'Mint', 'Salmon', 'Indigo', 'Violet', 'Beige', 'Cream'
];

export const COLOR_HEX_MAP: Record<string, string> = {
    'White': '#FFFFFF',
    'Black': '#000000',
    'Red': '#FF0000',
    'Blue': '#0000FF',
    'Green': '#008000',
    'Yellow': '#FFFF00',
    'Orange': '#FF9E20',
    'Purple': '#800080',
    'Pink': '#FFC0CB',
    'Slate Gray':'#A1B7C8',
    'Slate Blue':'#5C7996',
    'Muted Lavender': '#A799B7',
    'Blue Stripe': '#8EAFE2',
    'Chocolate': '#3D2B24',
    'Navy Blue': '#2E3D59',
    'Gray': '#808080',
    'Brown': '#A52A2A',
    'Navy': '#000080',
    'Rust': '#B7410E',
    'Peach': '#FFCC99',
    'Gold': '#FFD700',
    'Silver': '#C0C0C0',
    'Bronze': '#CD7F32',
    'Copper': '#B87333',
    'Teal': '#008080',
    'Cyan': '#00FFFF',
    'Magenta': '#FF00FF',
    'Olive': '#808000',
    'Khaki': '#F0E68C',
    'Mustard': '#FFDB58',
    'Terracotta': '#E2725B',
    'Lavender': '#E6E6FA',
    'Turquoise': '#40E0D0',
    'Sky Blue': '#87CEEB',
    'Mint': '#98FF98',
    'Salmon': '#FA8072',
    'Indigo': '#4B0082',
    'Violet': '#EE82EE',
    'Beige': '#F5F5DC',
    'Cream': '#FFFDD0'
};

export interface VariantImage {
    file: File;
    preview: string;
}

export interface VariantForm {
    id: string;
    size: string;
    color: string;
    stock: string;
    status: 'active' | 'inactive';
    images: VariantImage[];
}

export const makeVariant = (): VariantForm => ({
    id: crypto.randomUUID(),
    size: '',
    color: '',
    stock: '0',
    status: 'active',
    images: [],
});