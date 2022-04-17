import {
  Box,
  Input,
  Flex,
  HStack,
  Text,
  Center,
  Heading,
  Link,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  FormErrorMessage,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { create } from 'ipfs-http-client';
import type { NextPage } from 'next';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@chakra-ui/react';

import Photo from '../components/Photo';

const IPFS_URL = 'https://ipfs.infura.io:5001/api/v0';

const CryptoJS = require('crypto-js');
const ipfs = create({ url: IPFS_URL });
const STORAGE = 'atato-ipfs';

const retrieveImages = () => {
  const data = localStorage.getItem(STORAGE);

  if (!data) {
    return [];
  }

  return JSON.parse(data) || [];
};

const Home: NextPage = () => {
  const [imgPrev, setImgPrev] = useState('');
  const [myImages, setMyImages] = useState<Array<{ hash: string; metadata: string }>>([]);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [fileAttached, setFileAttached] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    const images = retrieveImages();
    setMyImages(images);
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onChange = (e: any) => {
    setFileError('');
    const theFile = e.target.files[0];
    setFileAttached(theFile);
    const src = URL.createObjectURL(e.target.files[0]);
    setImgPrev(src);

    const reader = new FileReader();
    reader.onload = async function (event: any) {
      const binary = event.target.result;
      const md5 = CryptoJS.MD5(binary).toString();

      const storedImages = retrieveImages();
      const imageAlreadyExists = storedImages.find((image: Record<string, any>) => image.hash === md5);
      if (imageAlreadyExists) {
        setFileError('File already exists');
      }
    };
    reader.readAsBinaryString(theFile);
  };

  const resetForm = () => {
    reset({ name: '', description: '' });
    setFileAttached(null);
    setImgPrev('');
    onClose();
  };

  const onSubmitPhoto = (values: Record<string, any>) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async function (event: any) {
      const binary = event.target.result;
      const md5 = CryptoJS.MD5(binary).toString();
      const added = await ipfs.add(fileAttached!);
      const ipfsSrc = `https://ipfs.infura.io/ipfs/${added.path}`;

      const cid = await ipfs.add({
        content: JSON.stringify({
          name: values.name,
          fileName: fileAttached!.name,
          imageSrc: ipfsSrc,
          description: values.description,
          hash: md5,
        }),
      });

      const storedFiles = localStorage.getItem(STORAGE);
      const fileToSave = {
        hash: md5,
        metadata: cid.path,
      };

      if (!storedFiles) {
        localStorage.setItem(STORAGE, JSON.stringify([fileToSave]));
        setMyImages([fileToSave]);
      } else {
        const parsedFiles = [...JSON.parse(storedFiles), fileToSave];
        localStorage.setItem(STORAGE, JSON.stringify(parsedFiles));
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

    reader.readAsBinaryString(fileAttached!);
  };

  return (
    <Box>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        height="60px"
        px={10}
        mb={10}
        borderBottom="1px solid #e5e5e5"
        css={{
          boxShadow: 'rgb(4 17 29 / 25%) 0px 0px 8px 0px',
        }}
      >
        <HStack>
          <Text fontWeight="500">IPFS Photo Gallery</Text>
        </HStack>
        <HStack>
          <Button onClick={onOpen} colorScheme="orange">
            Add to Collection
          </Button>
        </HStack>
      </Flex>
      <Box px={10}>
        <Box mt={10}>
          <Center>
            <Heading>My Photos</Heading>
          </Center>

          <Box mt={5}>
            {myImages?.length > 0 && (
              <Wrap spacing="3rem">
                {myImages.map((image: any) => (
                  <WrapItem>
                    <Photo metadata={image.metadata} hash={image.hash} key={image.hash} />
                  </WrapItem>
                ))}
              </Wrap>
            )}

            {(!myImages || myImages?.length === 0) && (
              <>
                <Text>
                  No images found.{' '}
                  <Link color="blue.500" onClick={onOpen}>
                    Start uploading now
                  </Link>
                  .
                </Text>
              </>
            )}
          </Box>
        </Box>
        <Input type="file" ref={inputFileRef} onChange={onChange} hidden />
      </Box>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
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
              <Center>{imgPrev && <Image src={imgPrev} width="200px" height="200px" />}</Center>
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
    </Box>
  );
};

export default Home;
