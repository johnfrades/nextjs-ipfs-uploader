import { Box, Center, chakra, Spinner, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { useQuery } from 'react-query';

type Photo = {
  metadata: string;
  hash: string;
};

const Photo: React.FC<Photo> = ({ metadata, hash }) => {
  const { data, isLoading } = useQuery(hash, () =>
    fetch(`https://ipfs.infura.io/ipfs/${metadata}`).then((res) => res.json())
  );

  return (
    <Box minH="250px" width="350px" border="1px solid #e5e5e5" borderRadius="10px">
      {isLoading && (
        <Center height="100%">
          <Spinner />
        </Center>
      )}
      {!isLoading && data && (
        <>
          <Image width="200px" height="200px" src={data?.imageSrc} objectFit="cover" layout="responsive" />

          <Box px={3} pb={5}>
            <Center mt={2}>
              <Text fontWeight="500" fontSize="xl">
                {data.name}
              </Text>
            </Center>
            <Box mt={5}>
              <Text isTruncated>
                <chakra.span fontWeight="500">File Name</chakra.span>: {data.fileName}
              </Text>
              <Text isTruncated>
                <chakra.span fontWeight="500">Hash</chakra.span>: {data.hash}
              </Text>
              <Text>
                <chakra.span fontWeight="500">Description</chakra.span>: {data?.description}
              </Text>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Photo;
