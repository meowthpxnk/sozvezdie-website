import { axiosWithAuth, axiosClassic } from "@shared/api/interceptors";
import {
    Product,
} from "@entities";

class ProductService {
    private BASE_URL = "/device";

    async getProducts() {
        const response = await axiosClassic.get<Product[]>(`${this.BASE_URL}`);
        return response.data;
    }
    // async deleteDevice(device_name: TypeDeviceName) {
    //     await axiosWithAuth.delete(`${this.BASE_URL}/${device_name}`);
    // }

    // async updateDevcie(data: IDeviceProps) {
    //     await axiosWithAuth.put(`${this.BASE_URL}/${data.name}`, data);
    // }

    // async createDevice(device: IDevice) {
    //     await axiosWithAuth.post(`${this.BASE_URL}/create`, device);
    // }

    // async reloadDevice(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/reload`);
    // }

    // async stopDevice(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/stop`);
    // }

    // async startDevice(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/start`);
    // }

    // async removeAuth(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(
    //         `${this.BASE_URL}/${device_name}/remove_auth`
    //     );
    // }

    // async clearOutbox(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(
    //         `${this.BASE_URL}/${device_name}/clear_outbox`
    //     );
    // }

    // async updateProxy(device_name: TypeDeviceName) {
    //     await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/proxy`);
    // }
}

const productService = new ProductService();
export default productService;
