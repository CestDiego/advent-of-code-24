#!/usr/bin/env python3

import os
import random
import time
import subprocess
import threading
import curses
from itertools import cycle
import asyncio
from datetime import datetime

class ParticleSystem:
    def __init__(self, max_x, max_y):
        self.particles = []
        self.max_x = max_x
        self.max_y = max_y

    def add_particle(self, x, y):
        self.particles.append({
            'x': x, 'y': y,
            'dx': random.uniform(-1, 1),
            'dy': random.uniform(-1, 0),
            'life': random.randint(10, 30),
            'char': random.choice('*+.✨⭐️✦🎉')
        })

    def update(self):
        for p in self.particles:
            p['x'] += p['dx']
            p['y'] += p['dy']
            p['dy'] += 0.1  # gravity
            p['life'] -= 1
        self.particles = [p for p in self.particles if p['life'] > 0
                         and 0 <= p['x'] < self.max_x and 0 <= p['y'] < self.max_y]

class UltimateCelebration:
    def __init__(self):
        self.is_celebrating = False
        self.messages = [
            "🎉 SPECTACULAR! 🎊",
            "⭐️ MAGNIFICENT! ⭐️",
            "🎈 EXTRAORDINARY! 🎈",
            "🌟 PHENOMENAL! 🌟",
            "🎊 LEGENDARY! 🎊",
            "✨ INCREDIBLE! ✨"
        ]
        self.colors = {
            'red': '\033[91m',
            'green': '\033[92m',
            'yellow': '\033[93m',
            'blue': '\033[94m',
            'magenta': '\033[95m',
            'cyan': '\033[96m',
            'reset': '\033[0m'
        }

    def play_sound_sequence(self):
        sounds = ['Tink', 'Hero', 'Glass', 'Funk', 'Submarine']
        while self.is_celebrating:
            sound = random.choice(sounds)
            subprocess.run(['afplay', f'/System/Library/Sounds/{sound}.aiff'],
                         stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL)
            time.sleep(0.3)

    def speak_celebration(self):
        voices = ["Alex", "Samantha", "Fred", "Victoria", "Karen", "Daniel"]
        phrases = [
            "Wow! This is amazing!",
            "Time to celebrate!",
            "Let's party!",
            "Simply spectacular!",
            "You're doing great!"
        ]
        while self.is_celebrating:
            subprocess.run(['say', '-v', random.choice(voices),
                          random.choice(phrases)],
                         stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL)
            time.sleep(2)

    def show_notification(self, title, message):
        os.system(f"""
            osascript -e 'display notification "{message}" with title "{title}" sound name "Glass"'
        """)

    def terminal_celebration(self, stdscr):
        curses.start_color()
        curses.use_default_colors()
        for i in range(1, 8):
            curses.init_pair(i, i, -1)

        max_y, max_x = stdscr.getmaxyx()
        particles = ParticleSystem(max_x, max_y)

        frame = 0
        while self.is_celebrating:
            stdscr.clear()

            # Add new fireworks
            if frame % 10 == 0:
                particles.add_particle(random.randint(0, max_x-1), max_y-1)

            # Update and draw particles
            particles.update()
            for p in particles.particles:
                try:
                    stdscr.addstr(int(p['y']), int(p['x']), p['char'],
                                curses.color_pair(random.randint(1, 7)))
                except curses.error:
                    pass

            # Draw celebration message
            if frame % 20 == 0:
                message = random.choice(self.messages)
                try:
                    stdscr.addstr(max_y//2, max_x//2 - len(message)//2,
                                message, curses.A_BOLD | curses.color_pair(random.randint(1, 7)))
                except curses.error:
                    pass

            stdscr.refresh()
            frame += 1
            time.sleep(0.05)

    def celebrate(self, duration=10):
        """
        Launch an ultimate celebration with all effects!

        Args:
            duration (int): Duration of celebration in seconds
        """
        self.is_celebrating = True

        # Show initial notification
        self.show_notification("🎉 Ultimate Celebration!", "Get ready for something special!")

        # Start sound and speech threads
        sound_thread = threading.Thread(target=self.play_sound_sequence)
        speech_thread = threading.Thread(target=self.speak_celebration)

        sound_thread.start()
        speech_thread.start()

        # Run terminal celebration
        try:
            curses.wrapper(self.terminal_celebration)
        except KeyboardInterrupt:
            pass
        finally:
            time.sleep(duration)
            self.is_celebrating = False
            sound_thread.join()
            speech_thread.join()

            # Show ending notification
            self.show_notification("🎊 Celebration Complete!",
                                 "What a spectacular show!")

def celebrate(duration=10):
    """Wrapper function to create and start the celebration"""
    celebration = UltimateCelebration()
    celebration.celebrate(duration)

if __name__ == "__main__":
    celebrate()
