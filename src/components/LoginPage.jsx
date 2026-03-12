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
import { createRoom, getRoom, joinRoom, login, register } from "../api";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [password, setPassword] = useState("");

  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [createdRoomData, setCreatedRoomData] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token"),
  );

  const handleSubmit = async () => {
    try {
      const { data } = isLogin
        ? await login({ username: authUsername, password: authPassword })
        : await register({ username: authUsername, password: authPassword });

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsAuthenticated(true);
        toast({ title: "Login Successful", status: "success" });
      } else {
        toast({
          title: "Registered Successfully! Please log in.",
          status: "success",
        });
        setIsLogin(true);
        setAuthPassword("");
      }
    } catch (err) {
      const msg = err.response?.data?.msg || "Something went Wrong";
      toast({ title: "Error", description: msg, status: "error" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setAuthUsername("");
    setAuthPassword("");
  };

  const saveUserAndRedirect = async (rId) => {
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

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast({
        title: "Session expired",
        description: "Please log in again.",
        status: "error",
      });
      handleLogout();
      return;
    }
    navigate(`/editor/${rId}`);
  };

  const handleJoin = async () => {
    if (!roomId) {
      toast({
        title: "Room ID Required",
        description: "Please paste a Room Id to join.",
        status: "warning",
      });
      return;
    }
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
      } else if (!err.response) {
        toast({
          title: "Network Error",
          description: "Cannot reach the server.Check your connection.",
          status: "error",
        });
      } else {
        toast({
          title: "Access Denied",
          description: err.response?.data?.msg || "Invalid Credentials",
          status: "error",
        });
      }
    }
  };

  const handleCreate = async () => {
    const storedUser = JSON.parse(localStorage.getItem.getItem("user"));
    const owner = storedUser?.username || "Unknown";

    try {
      const { data } = await createRoom({
        name: newRoomName || "Untitled",
        owner,
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
        isClosable: true,
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
        const serverMsg = err.response?.data?.error || "Could not create room.";
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
        status: "info",
        duration: 1500,
      });

      saveUserAndRedirect(createdRoomData.roomId);
    } else {
      toast({
        title: "Room data missing",
        description: "Please try creating the room again.",
        status: "error",
      });
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
          {isAuthenticated
            ? `Logged in as ${JSON.parse(localStorage.getItem("user"))?.username}`
            : "Create Joint, Secure Sessions."}
        </Text>

        {!isAuthenticated && (
          <VStack spacing={3} width="100%">
            <Input
              placeholder="Username"
              size="md"
              bg="gray.800"
              border="none"
              _focus={{ border: "1px solid #7928CA" }}
              value={authUsername}
              onChange={(e) => setAuthUsername(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              size="md"
              bg="gray.800"
              border="none"
              _focus={{ border: "1px solid #7928CA" }}
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
            />
            <Button colorScheme="blue" width="100%" onClick={handleSubmit}>
              {isLogin ? "Login" : "Register"}
            </Button>
            <Text
              cursor="pointer"
              color="blue.400"
              fontSize="sm"
              onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Need an account?" : "Already have an account?"}
            </Text>
          </VStack>
        )}

        {isAuthenticated && (
          <>
            <Tabs
              isFitted
              variant="soft-rounded"
              colorScheme="purple"
              width="100%">
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
                      placeholder="Paste Room ID (e.g. A3F9C2)"
                      size="md"
                      bg="gray.800"
                      border="none"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                    />

                    <Input
                      placeholder="Room Password"
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
                      placeholder="Meeting Name (Optional)"
                      size="md"
                      bg="gray.800"
                      border="none"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                    />
                    <Input
                      placeholder="Set a Room Password"
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
                      isDisabled={!username}>
                      Start New Session
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Button
              variant="ghost"
              colorScheme="red"
              size="sm"
              width="100%"
              onClick={handleLogout}>
              Log Out
            </Button>
          </>
        )}
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
                  Password:
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
