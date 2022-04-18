import { Box, Text, Center, Heading, Link, useDisclosure, Wrap, WrapItem } from '@chakra-ui/react';
import AddPhotoDrawer from '@components/AddPhotoDrawer';
import Navbar from '@components/Navbar';
import { STORAGE_KEY } from '@constants/storageKey';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';

import Photo from '@components/Photo';
import { MyImage } from 'types';

const retrieveImages = () => {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  return JSON.parse(data) || [];
};

const Home: NextPage = () => {
  const [myImages, setMyImages] = useState<MyImage[]>([]);

  useEffect(() => {
    const images = retrieveImages();
    setMyImages(images);
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      <Head>
        <title>IPFS Photo Gallery</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Navbar onOpen={onOpen} />

      <Box px={10}>
        <Box mt={10}>
          <Center>
            <Heading>My Photos</Heading>
          </Center>

          <Box mt={5}>
            {myImages?.length > 0 && (
              <Wrap spacing="3rem">
                {myImages.map((image) => (
                  <WrapItem key={image.hash}>
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
      </Box>

      <AddPhotoDrawer isOpen={isOpen} onClose={onClose} retrieveImages={retrieveImages} setMyImages={setMyImages} />
    </Box>
  );
};

export default Home;
