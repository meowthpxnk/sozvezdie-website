import { axiosWithAuth } from "@/shared/api/interceptors";
import {
    IDevice,
    IDeviceProps,
    TypeDeviceName,
} from "@/shared/types/device.types";

class DeviceService {
    private BASE_URL = "/device";

    async getDevices() {
        console.log("response get devices start");
        const response = await axiosWithAuth.get<IDevice[]>(`${this.BASE_URL}`);
        console.log(response);
        console.log("response get devices end");

        return response.data;
    }
    async getDevice(device_name: TypeDeviceName) {
        const response = await axiosWithAuth.get<IDevice>(
            `${this.BASE_URL}/${device_name}`
        );

        return response.data;
    }
    async deleteDevice(device_name: TypeDeviceName) {
        await axiosWithAuth.delete(`${this.BASE_URL}/${device_name}`);
    }

    async updateDevcie(data: IDeviceProps) {
        await axiosWithAuth.put(`${this.BASE_URL}/${data.name}`, data);
    }

    async createDevice(device: IDevice) {
        await axiosWithAuth.post(`${this.BASE_URL}/create`, device);
    }

    async reloadDevice(device_name: TypeDeviceName) {
        await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/reload`);
    }

    async stopDevice(device_name: TypeDeviceName) {
        await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/stop`);
    }

    async startDevice(device_name: TypeDeviceName) {
        await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/start`);
    }

    async removeAuth(device_name: TypeDeviceName) {
        await axiosWithAuth.patch(
            `${this.BASE_URL}/${device_name}/remove_auth`
        );
    }

    async clearOutbox(device_name: TypeDeviceName) {
        await axiosWithAuth.patch(
            `${this.BASE_URL}/${device_name}/clear_outbox`
        );
    }

    async updateProxy(device_name: TypeDeviceName) {
        await axiosWithAuth.patch(`${this.BASE_URL}/${device_name}/proxy`);
    }
}

const deviceService = new DeviceService();
export default deviceService;
