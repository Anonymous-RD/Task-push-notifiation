import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Switch,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  showOnUnlock: boolean;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isUnlockModalVisible, setIsUnlockModalVisible] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const addTask = () => {
    if (newTaskTitle.trim() !== "") {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        completed: false,
        showOnUnlock: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      setIsAddModalVisible(false);
    }
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const toggleTaskUnlock = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, showOnUnlock: !task.showOnUnlock } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: () => setTasks(tasks.filter((task) => task.id !== id)),
      },
    ]);
  };

  const simulateUnlock = () => {
    setIsUnlockModalVisible(true);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={[styles.taskItem, item.completed && styles.completedTask]}>
      <TouchableOpacity
        onPress={() => toggleTaskCompletion(item.id)}
        style={styles.checkbox}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <Text
        style={[styles.taskTitle, item.completed && styles.completedTaskText]}
      >
        {item.title}
      </Text>
      <Switch
        value={item.showOnUnlock}
        onValueChange={() => toggleTaskUnlock(item.id)}
      />
      <TouchableOpacity
        onPress={() => deleteTask(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.header}>TaskMaster</Text>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.unlockButton} onPress={simulateUnlock}>
        <Text style={styles.unlockButtonText}>🔓 Simulate Unlock</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalView}>
          <TextInput
            style={styles.input}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            placeholder="Enter new task"
          />
          <TouchableOpacity style={styles.modalButton} onPress={addTask}>
            <Text style={styles.modalButtonText}>Add Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setIsAddModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isUnlockModalVisible}
        onRequestClose={() => setIsUnlockModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalHeader}>Tasks to Remember:</Text>
          <FlatList
            data={tasks.filter((task) => task.showOnUnlock && !task.completed)}
            renderItem={({ item }) => (
              <Text style={styles.unlockTaskItem}>{item.title}</Text>
            )}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setIsUnlockModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  list: {
    flex: 1,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  completedTask: {
    backgroundColor: "#e0e0e0",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
  },
  completedTaskText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteButtonText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    position: "absolute",
    right: 30,
    bottom: 30,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  addButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  unlockButton: {
    position: "absolute",
    left: 30,
    bottom: 30,
    backgroundColor: "#34C759",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 5,
  },
  unlockButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginVertical: 5,
    minWidth: 100,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  unlockTaskItem: {
    fontSize: 16,
    marginVertical: 5,
  },
});
