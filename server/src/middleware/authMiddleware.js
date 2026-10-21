const Session = require('../models/Session');
const User = require('../models/User');

async function authenticate(request, _response, next) {
  try {
    const token =
      request.cookies?.arbor_session ||
      request.headers.cookie?.match(/(?:^|; )arbor_session=([^;]+)/)?.[1] ||
      request.headers.authorization?.replace(/^Bearer\s+/, '');

    if (!token) {
      request.user = null;
      return next();
    }

    const session = await Session.findOne({
      token,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      request.user = null;
      return next();
    }

    const user = await User.findById(session.userId);
    request.user = user || null;
    request.sessionToken = token;
    return next();
  } catch (error) {
    request.user = null;
    return next();
  }
}

function requireAuth(request, response, next) {
  if (!request.user) {
    return response.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  return next();
}

function requireAdmin(request, response, next) {
  if (!request.user || request.user.role !== 'admin') {
    return response.status(403).json({ error: 'Admin access required.' });
  }
  return next();
}

module.exports = { authenticate, requireAuth, requireAdmin };
