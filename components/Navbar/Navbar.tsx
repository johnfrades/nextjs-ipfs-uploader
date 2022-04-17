import { HStack, Text, Button, Flex } from '@chakra-ui/react';

type Navbar = {
  onOpen: () => void;
};

const Navbar: React.FC<Navbar> = ({ onOpen }) => {
  return (
    <Flex
      position="sticky"
      bg="white"
      top={0}
      zIndex={10}
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
  );
};

export default Navbar;
