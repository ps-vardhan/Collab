import {
  Box,
  Button,
  Code,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "../api";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [createdRoomData, setCreatedRoomData] = useState(null);

  const saveUserAndRedirect = async (rId) => {
    if (!username.trim()) {
      toast({ title: "Please enter your Display Name", status: "warning" });
      return;
    }

    try {
      await getRoom(rId);
    } catch (err) {
      toast({
        title: "Invalid Room",
        description: "This room does not exist or has expired.",
        status: "error",
      });
      return;
    }

    let userId;
    try {
      const { data } = await getUser(username);
      userId = data.id;
    } catch (err) {
      userId = Date.now().toString();
    }

    const user = { username, id: userId };
    localStorage.setItem("user", JSON.stringify(user));

    navigate(`/editor/${rId}`);
  };

  const handleJoin = async () => {
    if (!roomId) return;
    if (!password) {
      toast({ title: "Password Required", status: "warning" });
      return;
    }
    try {
      await joinRoom({ roomId, password });
      localStorage.setItem("current_room_pass", password);
      saveUserAndRedirect(roomId);
    } catch (err) {
        const status = err.response?.status;
      const msg = err.response?.data?.msg;
      
      if (status === 404) {
        toast({
          title: "Room Not Found",
          description: "No room exists with that Id.Check and try again.",
          status: "error",
        });
      } else if (status === 401) {
        toast({
          title: "Access Denied",
          description: "Incorrect password for this room.",
          status: "error",
        });
      } else {
        toast({
          title: "Access Denied",
          description: msg || "Invalid Credentials",
          status: "error",
        });
    }
  };

  const handleCreate = async () => {
    if (!username) {
      toast({ title: "Name required", status: "warning" });
      return;
    }
    if (!password) {
      toast({ title: "Password Required", status: "warning" });
      return;
    }
    try {
      const { data } = await createRoom({
        name: newRoomName || "Untitled",
        owner: username,
      });
      setCreatedRoomData({
        roomId: data.roomId,
        passwordKey: data.passwordKey,
      });

      toast({
        title: "Room Created!",
        description: `Your Room ID is ${data.roomId}. Share it with your Team.`,
        status: "success",
        duration: 5000,
        isClosable:true,
      });
      onOpen();
    } catch (err) {
      if (!err.response) {
        toast({
          title: "Network Error",
          description: "Cannot reach the server. Check your Connection.",
          status: "error",
        });
      } else {
        const serverMsg = err.response?.data?.error || "Something went Wrong.";
        toast({
          title: "Error Creating Room",
          description: serverMsg,
          status: "error",
        });
      }
    }
  };

  const enterRoom = () => {
    if (createdRoomData) {
      localStorage.setItem("current_room_pass", createdRoomData.passwordKey);
      toast({
        title: "Entering Room...",
        status: "success",
        duration: 1500,
      });

      saveUserAndRedirect(createdRoomData.roomId);
    }
  };

  return (
    <Box
      height="100vh"
      width="100vw"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, #0f0a19, #1a1a2e)"
      color="white">
      <VStack
        spacing={6}
        width={{ base: "90%", md: "450px" }}
        p={8}
        bg="gray.900"
        borderRadius="xl"
        boxShadow="2xl"
        border="1px solid"
        borderColor="gray.700">
        <Heading size="lg" bg="lightblue" bgClip="text" textAlign="center">
          Collaborative Space
        </Heading>

        <Text color="gray.400" fontSize="sm" textAlign="center">
          Create Joint, Secure Sessions.
        </Text>
        <Input
          placeholder="Enter Your Name"
          size="lg"
          bg="gray.800"
          border="none"
          _focus={{ border: "1px solid #7928CA" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Tabs isFitted variant="soft-rounded" colorScheme="purple" width="100%">
          <TabList mb="1.5em" bg="gray.800" borderRadius="full" p={1}>
            <Tab
              color="gray.400"
              _selected={{ color: "white", bg: "purple.600" }}>
              Join Session
            </Tab>
            <Tab
              color="gray.400"
              _selected={{ color: "white", bg: "purple.600" }}>
              Create Session
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0} py={0}>
              <VStack spacing={4}>
                <Input
                  placeholder="Enter Room ID "
                  size="md"
                  bg="gray.800"
                  border="none"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />

                <Input
                  placeholder="Enter Room Password"
                  type="password"
                  size="md"
                  bg="gray.800"
                  border="none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  colorScheme="purple"
                  width="100%"
                  size="lg"
                  onClick={handleJoin}
                  isDisabled={!roomId || !username}>
                  Join Session
                </Button>
              </VStack>
            </TabPanel>

            <TabPanel px={0} py={0}>
              <VStack spacing={4}>
                <Input
                  placeholder="Enter Meeting Name"
                  size="md"
                  bg="gray.800"
                  border="none"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
                <Input
                  placeholder="Enter Password"
                  type="password"
                  size="md"
                  bg="gray.800"
                  border="none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  colorScheme="purple"
                  width="100%"
                  size="lg"
                  onClick={handleCreate}
                  isDisabled={!username || !newRoomName || !password}>
                  Start New Session
                </Button>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>Room Created!</ModalHeader>
          <ModalBody>
            <VStack align="start" spacing={4}>
              <Text>Share these credentials with your team:</Text>
              <Box>
                <Text fontWeight="bold" color="gray.400">
                  Room ID:
                </Text>
                <Code fontSize="xl" colorScheme="purple">
                  {createdRoomData?.roomId}
                </Code>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.400">
                  Access Key:
                </Text>
                <Code fontSize="xl" colorScheme="purple">
                  {createdRoomData?.passwordKey}
                </Code>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={enterRoom}>
              Enter Room
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
export default LoginPage;
