package com.example.ecommerce.service;

import com.example.ecommerce.controller.UserDto;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDto.UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserDto.UserProfileResponse.builder()
                .name(user.getName())
                .email(user.getEmail())
                .address(user.getAddress())
                .interests(user.getInterests() == null ? new ArrayList<>() : user.getInterests())
                .role(user.getRole().name())
                .build();
    }

    public UserDto.UserProfileResponse updateUserProfile(String email, UserDto.UpdateProfileRequest request) {
        User user = userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getInterests() != null) {
            user.setInterests(request.getInterests());
        }

        User updatedUser = userRepository.save(user);

        return UserDto.UserProfileResponse.builder()
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .address(updatedUser.getAddress())
                .interests(updatedUser.getInterests() == null ? new ArrayList<>() : updatedUser.getInterests())
                .role(updatedUser.getRole().name())
                .build();
    }
}
