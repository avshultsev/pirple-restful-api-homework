const { promises: fs } = require('fs');
const path = require('path');

const commonPath = path.join(__dirname, '..', '.data');
const createPath = (...args) => path.join(commonPath, ...args);

const createFolder = async (dir, phone) => {
  const dirPath = createPath(dir, phone);
  try {
    await fs.mkdir(dirPath, {recursive: false});
  } catch (err) {
    throw new Error(err);
  }
};

const listItems = async (...dir) => {
  const dirPath = createPath(...dir);
  try {
    const items = await fs.readdir(dirPath);
    const trimExtensions = name => {
      const dotIdx = name.indexOf('.');
      return name.substring(0, dotIdx);
    }
    return items.map(trimExtensions);
  } catch (err) {
    throw new Error(err);
  }
};

const rename = async (dir, oldName, newName) => {
  const filePath = createPath(dir, oldName);
  const newFilePath = createPath(dir, newName);
  try {
    await fs.access(newFilePath);
    console.log(`Error renaming ${oldName} to ${newName} because this name is already taken!`);
  } catch (err) {
    try {
      await fs.rename(filePath, newFilePath);
    } catch (err) {
      throw new Error(err);
    }
  }
};

const writeToFile = (flag = 'w') => async (...args) => {
  const data = args.pop();
  const filePath = createPath(...args);
  const jsonData = JSON.stringify(data);
  try {
    await fs.writeFile(filePath, jsonData, { flag });
  } catch (err) {
    throw new Error(err);
  }
};

const createFile = writeToFile('wx');
const updateFile = writeToFile();

const readFile = async (dir, fileName) => {
  const filePath = createPath(dir, fileName);
  try {
    const fileHandle = await fs.open(filePath, 'r');
    try {
      const fileData = await fs.readFile(fileHandle, 'utf-8');
      return JSON.parse(fileData);
    } catch (err) {
      console.log('Error reading file!', err);
    } finally {
      fileHandle.close();
    }
  } catch (err) { // if file does not exist
    throw new Error(err);
  }
};

const deleteFile = async (dir, fileName) => {
  const filePath = createPath(dir, fileName);
  try {
    await fs.rm(filePath, { recursive: true });
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { createFile, readFile, updateFile, deleteFile, rename, listItems, createFolder};