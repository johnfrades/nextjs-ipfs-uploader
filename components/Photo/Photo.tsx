import { Box, Center, chakra, Text, Skeleton, SkeletonText } from '@chakra-ui/react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { useQuery } from 'react-query';

type Photo = {
  metadata: string;
  hash: string;
};

const Photo: React.FC<Photo> = ({ metadata, hash }) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  const { data, isLoading } = useQuery([hash, inView], () =>
    fetch(`https://ipfs.infura.io/ipfs/${metadata}`).then((res) => res.json())
  );

  return (
    <Box minH="350px" width="350px" border="1px solid #e5e5e5" borderRadius="10px" ref={ref}>
      {isLoading && (
        <>
          <Skeleton height="300px" width="full" />
          <Box px={3} pb={5}>
            <SkeletonText mt="4" noOfLines={3} spacing="4" />
          </Box>
        </>
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
