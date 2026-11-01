# Makefile for Linux POSIX OS Engine
# Course: Operating Systems and Systems Programming (25CS2104E)

CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -pthread
TARGET = bin/multi_agent_manager
SRCS = main.cpp logger.cpp process_manager.cpp ipc_manager.cpp resource_manager.cpp signal_manager.cpp file_manager.cpp
OBJS = $(SRCS:.cpp=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	@mkdir -p bin
	@mkdir -p ../logs
	@mkdir -p ../backups
	$(CXX) $(CXXFLAGS) -o $@ $(OBJS)
	@echo "Build successful: $(TARGET)"

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f *.o $(TARGET)
	rm -rf bin

.PHONY: all run clean
