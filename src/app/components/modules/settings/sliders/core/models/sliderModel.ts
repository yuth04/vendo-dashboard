export interface Carousel {
    id: number;
    title: string;
    description: string;
    image: string;
    link: string | null;
    position: number;
    status: boolean;
    image_file_id: string | null;
}

export interface CarouselListResponse {
    message: string;
    carousels: Carousel[];
}

export const INITIAL_CAROUSEL_DATA: CarouselListResponse = {
    message: '',
    carousels: []
};