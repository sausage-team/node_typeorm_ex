module.exports = {
  apps : [{
    name: 'Node_TypeOrm_Ts',
    script: 'ts-node',
    args: 'src/index.ts',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      'user' : 'node',
      'host' : '212.83.163.1',
      'ref'  : 'origin/master',
      'repo' : 'git@github.com:repo.git',
      'path' : '/var/www/production',
      'ssh_options' : "StrictHostKeyChecking=no",
      'pre-deploy': 'git fetch --all',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'env' : {
        "NODE_ENV": "production"
      }
    }
  }
};
