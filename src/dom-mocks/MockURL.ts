import uuid from "uuid";
import MockBlob from "./MockBlob";

interface ObjectUrls {
  [url: string]: MockBlob;
}

const urls: ObjectUrls = {};

const createObjectURL = (mockBlob: MockBlob) => {
  const id = uuid();
  const url = `blob:http://localhost/${id}`;

  urls[url] = mockBlob;

  return url;
};

const MockURL = { createObjectURL };

export default MockURL;

export const mockFetchFromObjectUrl = (url: string): MockBlob => urls[url];
