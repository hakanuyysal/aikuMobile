"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const linkedinAuth_controller_1 = __importDefault(require("../controllers/linkedinAuth.controller"));
const supabase_1 = require("../config/supabase");
const linkedInService_1 = require("../services/linkedInService");
const router = express_1.default.Router();

router.get('/auth/linkedin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isMobile = req.query.from === 'mobile';
        const redirectTo = isMobile ? 'yourapp://auth/linkedin-callback' : `${process.env.CLIENT_URL}/auth/callback`;
        
        console.log('[LinkedIn Auth] Initiating OAuth', { redirectTo, isMobile });

        const { data, error } = yield supabase_1.supabase.auth.signInWithOAuth({
            provider: 'linkedin_oidc',
            options: {
                redirectTo,
                queryParams: {
                    prompt: 'consent',
                    from: isMobile ? 'mobile' : 'web',
                },
            },
        });
        if (error) throw error;
        if (!data.url) throw new Error('Auth URL alınamadı');

        console.log('[LinkedIn Auth] Redirecting to:', data.url);
        res.redirect(data.url);
    } catch (error) {
        console.error('[LinkedIn Auth] Error:', error);
        res.redirect(`${process.env.CLIENT_URL}/auth/login?error=linkedin-auth-failed`);
    }
}));

router.get('/auth/linkedin/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, state, from } = req.query;
    console.log('[LinkedIn Callback] Received:', { code, state, from });

    if (!code) {
        console.error('[LinkedIn Callback] No code provided');
        return res.redirect(`${process.env.CLIENT_URL}/auth/login?error=no-code`);
    }

    try {
        const { data, error } = yield supabase_1.supabase.auth.exchangeCodeForSession(code.toString());
        if (error) throw error;

        console.log('[LinkedIn Callback] Session exchanged:', { userId: data.user?.id });

        const linkedInService = new linkedInService_1.LinkedInService();
        const authResult = yield linkedInService.handleAuth(data);

        const isMobile = from === 'mobile';
        const redirectUrl = isMobile 
            ? `http://10.0.2.2:8081/auth/linkedin-callback?code=${code}&state=${state || ''}`
            : `${process.env.CLIENT_URL}/auth/callback?token=${authResult.token}&user=${encodeURIComponent(JSON.stringify(authResult.user))}&state=${state || ''}`;

        console.log('[LinkedIn Callback] Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('[LinkedIn Callback] Error:', error);
        res.redirect(`${process.env.CLIENT_URL}/auth/login?error=linkedin-callback-failed`);
    }
}));

router.post('/auth/linkedin/callback', linkedinAuth_controller_1.default.handleLinkedInCallback);

exports.default = router;