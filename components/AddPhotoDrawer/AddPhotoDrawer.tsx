import {
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Button,
  Box,
  Center,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
  DrawerFooter,
  Drawer,
  useToast,
} from '@chakra-ui/react';
import { IPFS_URL } from '@constants/ipfsUrl';
import { STORAGE_KEY } from '@constants/storageKey';
import { create } from 'ipfs-http-client';
import Image from 'next/image';
import { useRef, useState, Dispatch, SetStateAction, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { MyImage } from 'types';

type AddPhotoDrawer = {
  isOpen: boolean;
  onClose: () => void;
  retrieveImages: () => [];
  setMyImages: Dispatch<SetStateAction<MyImage[]>>;
};

const CryptoJS = require('crypto-js');
const ipfs = create({ url: IPFS_URL });

const AddPhotoDrawer: React.FC<AddPhotoDrawer> = ({ isOpen, onClose, retrieveImages, setMyImages }) => {
  const [fileAttached, setFileAttached] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imgPrev, setImgPrev] = useState('');
  const [fileHash, setFileHash] = useState('');

  const toast = useToast();
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const theFile = e.target.files![0];
    setFileAttached(theFile);
    const src = URL.createObjectURL(e.target.files![0]);
    setImgPrev(src);

    const reader = new FileReader();
    reader.onload = async function (event) {
      const binary = event.target!.result;
      const md5 = CryptoJS.MD5(binary).toString();

      const storedImages = retrieveImages();
      const imageAlreadyExists = storedImages.find((image: Record<string, any>) => image.hash === md5);
      if (imageAlreadyExists) {
        setFileError('File already exists.');
      } else {
        setFileHash(md5);
      }
    };
    reader.readAsBinaryString(theFile);
  };

  const resetForm = () => {
    reset({ name: '', description: '' });
    setFileAttached(null);
    setImgPrev('');
    setFileHash('');
    onClose();
  };

  const onSubmitPhoto = async (values: Record<string, any>) => {
    setIsLoading(true);
    const added = await ipfs.add(fileAttached!);
    const ipfsSrc = `https://ipfs.infura.io/ipfs/${added.path}`;

    const cid = await ipfs.add({
      content: JSON.stringify({
        name: values.name,
        fileName: fileAttached!.name,
        imageSrc: ipfsSrc,
        description: values.description,
        hash: fileHash,
      }),
    });

    const storedFiles = localStorage.getItem(STORAGE_KEY);
    const fileToSave = {
      hash: fileHash,
      metadata: cid.path,
    };

    if (!storedFiles) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([fileToSave]));
      setMyImages([fileToSave]);
    } else {
      const parsedFiles = [...JSON.parse(storedFiles), fileToSave];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedFiles));
      setMyImages(parsedFiles);
    }

    setIsLoading(false);
    resetForm();
    toast({
      title: 'Photo successfully uploaded!',
      status: 'success',
      duration: 3000,
    });
  };

  return (
    <>
      <Input type="file" ref={inputFileRef} onChange={(e) => onChange(e)} hidden />
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} closeOnOverlayClick={false}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Upload your Photo</DrawerHeader>

          <DrawerBody>
            <Button
              width="100%"
              variant="outline"
              colorScheme="orange"
              onClick={() => {
                inputFileRef!.current!.click();
              }}
            >
              {imgPrev ? 'Change' : 'Attach'} Photo
            </Button>

            <Box my={3}>
              <Center>{imgPrev && <Image src={imgPrev} width="200px" height="200px" objectFit="cover" />}</Center>
              <Center mt={1}>
                {!fileError && (
                  <Text isTruncated fontSize="sm">
                    {fileAttached?.name}
                  </Text>
                )}
                {fileError && <Text color="red">{fileError}</Text>}
              </Center>

              <VStack spacing={5} mt={3}>
                <FormControl isInvalid={errors?.name}>
                  <FormLabel>Image Name</FormLabel>
                  <Input disabled={!imgPrev} {...register('name', { required: true })} />
                  {errors?.name && <FormErrorMessage>Image name is required</FormErrorMessage>}
                </FormControl>
                <FormControl isInvalid={errors?.description}>
                  <FormLabel>Description</FormLabel>
                  <Textarea disabled={!imgPrev} {...register('description', { required: true })} />
                  {errors?.description && <FormErrorMessage>Description is required</FormErrorMessage>}
                </FormControl>
              </VStack>
            </Box>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              isLoading={isLoading}
              colorScheme="orange"
              disabled={!!fileError || isLoading}
              onClick={handleSubmit(onSubmitPhoto)}
            >
              Submit Photo
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AddPhotoDrawer;
