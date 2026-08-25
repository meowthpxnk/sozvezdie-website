import { axiosWithAuth } from "@/shared/api/interceptors";
import { IImage, TypeImageShortName } from "@/shared/types/image.types";

class ImageService {
    private BASE_URL = "/image";

    async getImages() {
        const response = await axiosWithAuth.get<IImage[]>(`${this.BASE_URL}`);
        return response.data;
    }

    async deleteImage(short_name: TypeImageShortName) {
        await axiosWithAuth.delete(`${this.BASE_URL}/${short_name}`);
    }

    async createImage(image: IImage) {
        await axiosWithAuth.post(`${this.BASE_URL}/create`, image);
    }
}

const imageService = new ImageService();
export default imageService;
