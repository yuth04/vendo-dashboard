import { slidersClient } from "@/src/app/components/modules/settings/sliders/core/api/sliderClient";

/**
 * Logic to filter the slider list based on search and status
 */
export const filterSliders = (list: any[], searchQuery: string, statusFilter: string) => {
    return list.filter((item: any) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All Statuses"
            ? true
            : statusFilter === "Active"
                ? !!item.status
                : !item.status;
        return matchesSearch && matchesStatus;
    });
};

/**
 * Logic to create a brand new slider
 */
export const createSliderLogic = async (formDataState: any) => {
    const data = new FormData();
    data.append('title', formDataState.title.trim());
    data.append('description', formDataState.description.trim() || "");
    if (formDataState.imageFile) {
        data.append('image', formDataState.imageFile);
    }
    data.append('link', formDataState.link.trim() || "");
    data.append('position', String(formDataState.position));
    data.append('status', formDataState.status ? "1" : "0");

    return await slidersClient.createSlider(data);
};

/**
 * Logic to update an existing slider
 */
export const updateSliderLogic = async (id: number, formDataState: any) => {
    const data = new FormData();
    data.append('title', formDataState.title.trim());
    data.append('description', formDataState.description.trim() || "");
    data.append('link', formDataState.link.trim() || "");
    data.append('position', String(formDataState.position));
    data.append('status', formDataState.status ? "1" : "0");

    // Only append image if a new file was actually selected
    if (formDataState.imageFile) {
        data.append('image', formDataState.imageFile);
    }

    return await slidersClient.updateSlider(id, data);
};

/**
 * Logic to toggle the status of an existing slider
 */
export const toggleSliderStatusLogic = async (slider: any) => {
    const newStatus = !slider.status;
    const formData = new FormData();

    Object.keys(slider).forEach((key) => {
        if (key === 'image') return;
        const val = slider[key];
        if (val !== null && val !== undefined) {
            formData.append(key, val);
        }
    });

    formData.set('status', newStatus ? '1' : '0');

    const response = await slidersClient.updateSlider(slider.id, formData);
    return { response, newStatus };
};

/**
 * Logic to safely delete a slider
 */
export const deleteSliderLogic = async (id: number) => {
    return await slidersClient.deleteSlider(id);
};