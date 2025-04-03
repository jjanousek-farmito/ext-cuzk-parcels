
type Parcel = {
    id: string;
    owner: string;


}//object keys of Parcels
type Parcels = {
    [key: string]: Parcel;
};

const parcels: Parcels = {
    "1": {
        id: "1",
        owner: "owner1",
    },
}
